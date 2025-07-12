const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const User = require('../models/User');

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        req.flash('error', 'You must be logged in to access this page');
        return res.redirect('/users/login');
    }
    next();
};

// Index - Show all questions
router.get('/', async (req, res) => {
    try {
        const { search, tag, sort = 'newest' } = req.query;
        let query = {};
        
        // Search functionality
        if (search) {
            query.$text = { $search: search };
        }
        
        // Tag filter
        if (tag) {
            query.tags = tag;
        }
        
        // Sort options
        let sortOption = {};
        switch (sort) {
            case 'newest':
                sortOption = { createdAt: -1 };
                break;
            case 'oldest':
                sortOption = { createdAt: 1 };
                break;
            case 'votes':
                sortOption = { 'votes.upvotes': -1 };
                break;
            case 'views':
                sortOption = { views: -1 };
                break;
            case 'unanswered':
                query.isAnswered = false;
                sortOption = { createdAt: -1 };
                break;
        }
        
        const questions = await Question.find(query)
            .populate('author', 'username reputation')
            .populate('acceptedAnswer')
            .sort(sortOption)
            .limit(20);
        
        // Get answer counts for each question
        const questionsWithAnswerCounts = await Promise.all(
            questions.map(async (question) => {
                const answerCount = await Answer.countDocuments({ question: question._id });
                return {
                    ...question.toObject(),
                    answerCount
                };
            })
        );
        
        res.render('questions/index', { 
            questions: questionsWithAnswerCounts,
            search,
            tag,
            sort
        });
    } catch (error) {
        req.flash('error', 'Error loading questions');
        res.redirect('/');
    }
});

// New question form
router.get('/new', requireAuth, (req, res) => {
    res.render('questions/new');
});

// Create new question
router.post('/', requireAuth, async (req, res) => {
    try {
        const { title, content, tags } = req.body;
        
        // Process tags
        const tagArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
        
        const question = new Question({
            title,
            content,
            author: req.session.user.id,
            tags: tagArray
        });
        
        await question.save();
        
        req.flash('success', 'Question posted successfully!');
        res.redirect(`/questions/${question._id}`);
    } catch (error) {
        req.flash('error', 'Error creating question');
        res.redirect('/questions/new');
    }
});

// Show question
router.get('/:id', async (req, res) => {
    try {
        const question = await Question.findById(req.params.id)
            .populate('author', 'username reputation')
            .populate('acceptedAnswer');
        
        if (!question) {
            req.flash('error', 'Question not found');
            return res.redirect('/questions');
        }
        
        // Increment view count
        question.views += 1;
        await question.save();
        
        // Get answers
        const answers = await Answer.find({ question: question._id })
            .populate('author', 'username reputation')
            .sort({ isAccepted: -1, voteCount: -1, createdAt: 1 });
        
        res.render('questions/show', { question, answers });
    } catch (error) {
        req.flash('error', 'Error loading question');
        res.redirect('/questions');
    }
});

// Edit question form
router.get('/:id/edit', requireAuth, async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        
        if (!question) {
            req.flash('error', 'Question not found');
            return res.redirect('/questions');
        }
        
        // Check if user is the author
        if (question.author.toString() !== req.session.user.id) {
            req.flash('error', 'You can only edit your own questions');
            return res.redirect(`/questions/${question._id}`);
        }
        
        res.render('questions/edit', { question });
    } catch (error) {
        req.flash('error', 'Error loading question');
        res.redirect('/questions');
    }
});

// Update question
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const { title, content, tags } = req.body;
        
        const question = await Question.findById(req.params.id);
        
        if (!question) {
            req.flash('error', 'Question not found');
            return res.redirect('/questions');
        }
        
        // Check if user is the author
        if (question.author.toString() !== req.session.user.id) {
            req.flash('error', 'You can only edit your own questions');
            return res.redirect(`/questions/${question._id}`);
        }
        
        // Process tags
        const tagArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
        
        question.title = title;
        question.content = content;
        question.tags = tagArray;
        
        await question.save();
        
        req.flash('success', 'Question updated successfully!');
        res.redirect(`/questions/${question._id}`);
    } catch (error) {
        req.flash('error', 'Error updating question');
        res.redirect(`/questions/${req.params.id}/edit`);
    }
});

// Delete question
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        
        if (!question) {
            req.flash('error', 'Question not found');
            return res.redirect('/questions');
        }
        
        // Check if user is the author or admin
        if (question.author.toString() !== req.session.user.id && !req.session.user.isAdmin) {
            req.flash('error', 'You can only delete your own questions');
            return res.redirect(`/questions/${question._id}`);
        }
        
        // Delete associated answers
        await Answer.deleteMany({ question: question._id });
        
        // Delete question
        await Question.findByIdAndDelete(req.params.id);
        
        req.flash('success', 'Question deleted successfully!');
        res.redirect('/questions');
    } catch (error) {
        req.flash('error', 'Error deleting question');
        res.redirect(`/questions/${req.params.id}`);
    }
});

// Vote on question
router.post('/:id/vote', requireAuth, async (req, res) => {
    try {
        const { voteType } = req.body;
        const question = await Question.findById(req.params.id);
        
        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }
        
        // Check if user is voting on their own question
        if (question.author.toString() === req.session.user.id) {
            return res.status(400).json({ error: 'You cannot vote on your own question' });
        }
        
        question.addVote(req.session.user.id, voteType);
        await question.save();
        
        res.json({ 
            success: true, 
            voteCount: question.voteCount,
            upvotes: question.votes.upvotes.length,
            downvotes: question.votes.downvotes.length
        });
    } catch (error) {
        res.status(500).json({ error: 'Error processing vote' });
    }
});

// Accept answer
router.post('/:id/accept-answer/:answerId', requireAuth, async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        const answer = await Answer.findById(req.params.answerId);
        
        if (!question || !answer) {
            req.flash('error', 'Question or answer not found');
            return res.redirect('/questions');
        }
        
        // Check if user is the question author
        if (question.author.toString() !== req.session.user.id) {
            req.flash('error', 'Only the question author can accept answers');
            return res.redirect(`/questions/${question._id}`);
        }
        
        // Check if answer belongs to this question
        if (answer.question.toString() !== question._id.toString()) {
            req.flash('error', 'Invalid answer');
            return res.redirect(`/questions/${question._id}`);
        }
        
        // Unaccept previously accepted answer if any
        if (question.acceptedAnswer) {
            const prevAccepted = await Answer.findById(question.acceptedAnswer);
            if (prevAccepted) {
                prevAccepted.unaccept();
                await prevAccepted.save();
            }
        }
        
        // Accept new answer
        answer.accept();
        await answer.save();
        
        question.acceptedAnswer = answer._id;
        question.isAnswered = true;
        await question.save();
        
        req.flash('success', 'Answer accepted successfully!');
        res.redirect(`/questions/${question._id}`);
    } catch (error) {
        req.flash('error', 'Error accepting answer');
        res.redirect(`/questions/${req.params.id}`);
    }
});

module.exports = router; 