/* eslint-disable react/no-unescaped-entities */
import React, { useState } from 'react';
import { Button, Container, Paper, Text, TextInput } from '@mantine/core';
import { Flashcard } from './components';

const data = [
  {
    english: 'apple',
    german: 'Apfel',
    type: 'noun',
    article: 'der'
  },
  {
    english: 'house',
    german: 'Haus',
    type: 'noun',
    article: 'das'
  },
  {
    english: 'house',
    german: 'Haus',
    type: 'others',
    article: ''
  },
  // Add more flashcard data as needed
];

function App() {
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [selectedArticle, setSelectedArticle] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [incorrectAttempt, setIncorrectAttempt] = useState(false);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleArticleSelection = (article) => {
    setSelectedArticle(article);
  };

  const handleCheckAnswer = () => {
    const { german, article, type } = data[flashcardIndex];

    if (type == 'noun') {
      if (inputValue.trim() === german && selectedArticle.toLowerCase() === article.toLowerCase()) {
        setCorrect(true);
      } else {
        setIncorrectAttempt(true);
      }
    } else {
      if (inputValue.trim().toLowerCase() === german.toLowerCase) {
        setCorrect(true);
      } else {
        setIncorrectAttempt(true);
      }
    }

  };

  const handleNextCard = () => {
    setFlashcardIndex((prevIndex) => (prevIndex + 1) % data.length);
    setInputValue('');
    setSelectedArticle('');
    setShowAnswer(false);
    setCorrect(false);
    setIncorrectAttempt(false);
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
    setCorrect(true);
  };

  return (
    <Container size="md">
      <Paper padding="lg" shadow="sm" style={{ minHeight: '300px' }}>
        <Flashcard data={data[flashcardIndex]} mode="english" />
        <TextInput
          placeholder="Enter your answer..."
          value={inputValue}
          onChange={handleInputChange}
          fullWidth
          style={{ marginTop: '16px' }}
        />
        <div style={{ marginTop: '16px' }}>
          <Text>Select the article:</Text>
          <div>
            {['der', 'die', 'das'].map((article) => (
              <Button
                key={article}
                onClick={() => handleArticleSelection(article)}
                variant={selectedArticle === article ? 'outline' : 'filled'}
                style={{ marginRight: '8px', marginTop: '8px' }}
              >
                {article}
              </Button>
            ))}
          </div>
        </div>
        <Button onClick={handleCheckAnswer} style={{ marginTop: '8px' }}>
          Check Answer
        </Button>
        {incorrectAttempt && <div style={{ marginTop: '16px' }}>
          <Button onClick={handleShowAnswer} style={{ marginRight: '8px' }}>
            Show Answer
          </Button>
          {showAnswer && <Text style={{ marginTop: '16px' }}> {data[flashcardIndex].article} {data[flashcardIndex].german}</Text>}
        </div>}
        {incorrectAttempt && (
          <Text align="center" style={{ marginTop: '16px', color: 'red' }}>Sorry, that's incorrect. Please try again.</Text>
        )}
        {correct && (
          <div>
            {!incorrectAttempt && <Text align="center" style={{ marginTop: '16px', marginBottom: '8px' }}>Congratulations! You're correct!</Text>}
            <Button onClick={handleNextCard}>Next Card</Button>
          </div>
        )}
      </Paper>
    </Container>
  );
}

export default App;
