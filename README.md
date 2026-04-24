# AI Job Recommender System

This project is an AI-powered job recommendation system that suggests relevant job roles based on user-provided skills. It uses semantic search with transformer-based embeddings combined with skill-based matching to improve recommendation accuracy.

---

## Overview

The system takes user input in the form of skills and returns the most relevant job listings by comparing the input with precomputed job embeddings. A hybrid ranking approach is used to balance semantic similarity and exact skill matches.

---

## Features

- Semantic search using transformer embeddings
- Hybrid ranking combining similarity and skill matching
- Precomputed embeddings for faster inference
- Full-stack implementation using Flask and React
- Deployed as a production-ready web application

---

## Technology Stack

### Backend
- Python
- Flask
- Sentence Transformers (MiniLM)
- NumPy
- Scikit-learn
- Joblib

### Frontend
- React.js
- Custom CSS

### Deployment
- Render

---

## System Workflow

1. User enters skills (e.g., python, aws, docker)
2. Input is converted into embeddings using a transformer model
3. The embedding is compared with stored job embeddings
4. A hybrid score is calculated using:
   - Semantic similarity
   - Skill matching score
5. Top matching jobs are returned

---


---

## Live Application

https://nlp-jx7b.onrender.com

