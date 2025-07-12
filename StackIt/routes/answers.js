const express = require('express');
const router = express.Router();
const Answer = require('../models/Answer');
const Question = require('../models/Question');

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        req.flash('error', 'You must be logged in to access this page');
        return res.redirect('/users/login');
    }
    next();
};

// Create new answer
router.post('/', requireAuth, async (req, res) => {
    try {
        const { content, questionId } = req.body;
        
        const question = await Question.findById(questionId);
        if (!question) {
            req.flash('error', 'Question not found');
            return res.redirect('/questions');
        }
        
        const answer = new Answer({
            content,
            author: req.session.user.id,
            question: questionId
        });
        
        await answer.save();
        
        req.flash('success', 'Answer posted successfully!');
        res.redirect(`/questions/${questionId}`);
    } catch (error) {
        req.flash('error', 'Error posting answer');
        res.redirect(`/questions/${req.body.questionId}`);
    }
});

// Edit answer form
router.get('/:id/edit', requireAuth, async (req, res) => {
    try {
        const answer = await Answer.findById(req.params.id)
            .populate('question', 'title');
        
        if (!answer) {
            req.flash('error', 'Answer not found');
            return res.redirect('/questions');
        }
        
        // Check if user is the author
        if (answer.author.toString() !== req.session.user.id) {
            req.flash('error', 'You can only edit your own answers');
            return res.redirect(`/questions/${answer.question._id}`);
        }
        
        res.render('answers/edit', { answer });
    } catch (error) {
        req.flash('error', 'Error loading answer');
        res.redirect('/questions');
    }
});

// Update answer
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const { content } = req.body;
        
        const answer = await Answer.findById(req.params.id);
        
        if (!answer) {
            req.flash('error', 'Answer not found');
            return res.redirect('/questions');
        }
        
        // Check if user is the author
        if (answer.author.toString() !== req.session.user.id) {
            req.flash('error', 'You can only edit your own answers');
            return res.redirect(`/questions/${answer.question}`);
        }
        
        // Save edit history
        answer.editHistory.push({
            content: answer.content,
            editedAt: new Date(),
            editedBy: req.session.user.id
        });
        
        answer.content = content;
        answer.isEdited = true;
        
        await answer.save();
        
        req.flash('success', 'Answer updated successfully!');
        res.redirect(`/questions/${answer.question}`);
    } catch (error) {
        req.flash('error', 'Error updating answer');
        res.redirect(`/answers/${req.params.id}/edit`);
    }
});

// Delete answer
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const answer = await Answer.findById(req.params.id);
        
        if (!answer) {
            req.flash('error', 'Answer not found');
            return res.redirect('/questions');
        }
        
        // Check if user is the author or admin
        if (answer.author.toString() !== req.session.user.id && !req.session.user.isAdmin) {
            req.flash('error', 'You can only delete your own answers');
            return res.redirect(`/questions/${answer.question}`);
        }
        
        const questionId = answer.question;
        
        // If this was the accepted answer, update the question
        if (answer.isAccepted) {
            const question = await Question.findById(questionId);
            if (question) {
                question.acceptedAnswer = null;
                question.isAnswered = false;
                await question.save();
            }
        }
        
        await Answer.findByIdAndDelete(req.params.id);
        
        req.flash('success', 'Answer deleted successfully!');
        res.redirect(`/questions/${questionId}`);
    } catch (error) {
        req.flash('error', 'Error deleting answer');
        res.redirect('/questions');
    }
});

// Vote on answer
router.post('/:id/vote', requireAuth, async (req, res) => {
    try {
        const { voteType } = req.body;
        const answer = await Answer.findById(req.params.id);
        
        if (!answer) {
            return res.status(404).json({ error: 'Answer not found' });
        }
        
        // Check if user is voting on their own answer
        if (answer.author.toString() === req.session.user.id) {
            return res.status(400).json({ error: 'You cannot vote on your own answer' });
        }
        
        answer.addVote(req.session.user.id, voteType);
        await answer.save();
        
        res.json({ 
            success: true, 
            voteCount: answer.voteCount,
            upvotes: answer.votes.upvotes.length,
            downvotes: answer.votes.downvotes.length
        });
    } catch (error) {
        res.status(500).json({ error: 'Error processing vote' });
    }
});

module.exports = router; 