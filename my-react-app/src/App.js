/* eslint-disable react/no-unescaped-entities */
import React, { useState } from 'react';
import { Box, Button, Container, Paper, Switch, Text, TextInput } from '@mantine/core';
import { Flashcard } from './components';

const data = [
  {
    english: 'apple',
    german: 'Apfel',
    type: 'noun',
    article: 'der',
    plural: 'Äpfel'
  },
  {
    english: 'house',
    german: 'Haus',
    type: 'noun',
    article: 'das',
    plural: 'Häuser'
  },
  {
    english: 'order',
    german: 'Bestellen',
    type: 'others',
  },
  // Add more flashcard data as needed
];

function App() {
  // random starting index
  const [flashcardIndex, setFlashcardIndex] = useState(Math.floor(Math.random() * data.length));
  const [inputValue, setInputValue] = useState('');
  const [selectedArticle, setSelectedArticle] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [incorrectAttempt, setIncorrectAttempt] = useState(false);

  // debug state
  const [debug, setDebug] = useState(false);
  const handleDebug = () => {
    setDebug(!debug);
  };

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
      if (inputValue.trim().toLowerCase() === german.toLowerCase()) {
        setCorrect(true);
      } else {
        setIncorrectAttempt(true);
      }
    }

  };

  const handleNextCard = () => {
    // setFlashcardIndex((prevIndex) => (prevIndex + 1) % data.length);
    // random card each time
    var newIndex = Math.floor(Math.random() * data.length);
    while (newIndex === flashcardIndex) {
      newIndex = Math.floor(Math.random() * data.length);
    }
    setFlashcardIndex(newIndex);
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

  const handleHideAnswer = () => {
    setShowAnswer(false);
  }

  return (
    <Container size="md">
      <Paper padding="lg" shadow="sm" style={{ minHeight: '300px' }}>
        {/* debug switch */}

        <Box my='sm' style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Switch checked={debug} onChange={handleDebug} style={{ marginBottom: '16px' }} label='Show debug info' />
        </Box>
        <Flashcard data={data[flashcardIndex]} mode="english" />
        <TextInput
          placeholder="Enter your answer..."
          value={inputValue}
          onChange={handleInputChange}
          fullWidth
          style={{ marginTop: '16px' }}
        />
        {/* no article for non-nouns */}
        {data[flashcardIndex].type == 'noun' && (<Box style={{ marginTop: '16px' }}>
          <Text>Select the article:</Text>
          <Box>
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
          </Box>
        </Box>)}
        <Button onClick={handleCheckAnswer} style={{ marginTop: '8px' }}>
          Check Answer
        </Button>
        {incorrectAttempt && <Box style={{ marginTop: '16px' }}>
          {/* button that switch between show and hide asnwers */}
          <Button onClick={showAnswer ? handleHideAnswer : handleShowAnswer} style={{ marginTop: '8px', marginBottom: '16px' }}>
            {showAnswer ? 'Hide Answer' : 'Show Answer'}
          </Button>

          {showAnswer && <Text> {data[flashcardIndex].article} {data[flashcardIndex].german}</Text>}
        </Box>}
        {(incorrectAttempt && !correct) && (
          <Text align="center" style={{ marginTop: '16px', color: 'red' }}>Sorry, that's incorrect. Please try again.</Text>
        )}
        {correct && (
          <Box>
            {(correct) && <Text align="center" style={{ marginTop: '16px', marginBottom: '8px' }}>Congratulations! You're correct!</Text>}
            <Button onClick={handleNextCard}>Next Card</Button>
          </Box>
        )}

        {debug && <Box>
          {/* debug info */}
          <Text size='lg' td='underline' fw={700} align="center" style={{ marginTop: '16px' }}>Debug Info</Text>
          <Text align="left">Input Value: {inputValue}</Text>
          <Text align="left">Selected Article: {selectedArticle}</Text>
          <Text align="left">Type: {data[flashcardIndex].type}</Text>
          <Text align="left">Show Answer: {showAnswer.toString()}</Text>
          <Text align="left">Correct: {correct.toString()}</Text>
          <Text align="left">Incorrect Attempt: {incorrectAttempt.toString()}</Text>

        </Box>}
      </Paper>
    </Container>
  );
}

export default App;
