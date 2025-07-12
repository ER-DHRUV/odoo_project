const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        maxlength: 10000
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true
    },
    votes: {
        upvotes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        downvotes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }]
    },
    isAccepted: {
        type: Boolean,
        default: false
    },
    isEdited: {
        type: Boolean,
        default: false
    },
    editHistory: [{
        content: String,
        editedAt: {
            type: Date,
            default: Date.now
        },
        editedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }]
}, {
    timestamps: true
});

// Virtual for vote count
answerSchema.virtual('voteCount').get(function() {
    return this.votes.upvotes.length - this.votes.downvotes.length;
});

// Method to add vote
answerSchema.methods.addVote = function(userId, voteType) {
    if (voteType === 'upvote') {
        // Remove from downvotes if exists
        this.votes.downvotes = this.votes.downvotes.filter(id => !id.equals(userId));
        // Add to upvotes if not already there
        if (!this.votes.upvotes.some(id => id.equals(userId))) {
            this.votes.upvotes.push(userId);
        }
    } else if (voteType === 'downvote') {
        // Remove from upvotes if exists
        this.votes.upvotes = this.votes.upvotes.filter(id => !id.equals(userId));
        // Add to downvotes if not already there
        if (!this.votes.downvotes.some(id => id.equals(userId))) {
            this.votes.downvotes.push(userId);
        }
    }
};

// Method to remove vote
answerSchema.methods.removeVote = function(userId) {
    this.votes.upvotes = this.votes.upvotes.filter(id => !id.equals(userId));
    this.votes.downvotes = this.votes.downvotes.filter(id => !id.equals(userId));
};

// Method to accept answer
answerSchema.methods.accept = function() {
    this.isAccepted = true;
};

// Method to unaccept answer
answerSchema.methods.unaccept = function() {
    this.isAccepted = false;
};

// Ensure virtual fields are serialized
answerSchema.set('toJSON', { virtuals: true });
answerSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Answer', answerSchema); 