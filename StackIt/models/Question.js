const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 300
    },
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
    tags: [{
        type: String,
        trim: true,
        maxlength: 20
    }],
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
    views: {
        type: Number,
        default: 0
    },
    isAnswered: {
        type: Boolean,
        default: false
    },
    acceptedAnswer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Answer'
    },
    status: {
        type: String,
        enum: ['open', 'closed', 'duplicate'],
        default: 'open'
    }
}, {
    timestamps: true
});

// Virtual for vote count
questionSchema.virtual('voteCount').get(function() {
    return this.votes.upvotes.length - this.votes.downvotes.length;
});

// Virtual for answer count
questionSchema.virtual('answerCount', {
    ref: 'Answer',
    localField: '_id',
    foreignField: 'question',
    count: true
});

// Index for search
questionSchema.index({ title: 'text', content: 'text', tags: 'text' });

// Method to add vote
questionSchema.methods.addVote = function(userId, voteType) {
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
questionSchema.methods.removeVote = function(userId) {
    this.votes.upvotes = this.votes.upvotes.filter(id => !id.equals(userId));
    this.votes.downvotes = this.votes.downvotes.filter(id => !id.equals(userId));
};

// Ensure virtual fields are serialized
questionSchema.set('toJSON', { virtuals: true });
questionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Question', questionSchema); 