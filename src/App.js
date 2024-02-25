/* eslint-disable react/no-unescaped-entities */
import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  Group,
  Paper,
  Switch,
  Text,
  TextInput,
} from "@mantine/core";
import { DebugItem, Flashcard } from "./components";

// Assuming you have your API token stored in a .env file
// const apiKey = process.env.AIRTABLE_TOKEN;

import Airtable from "airtable";

const base = new Airtable({
  apiKey:
    "pat1JpGAPoqMI6wGK.766a65c9a30a8979775e623823e7ab97923eebcbb6f3788eeca62c7ebca14ada",
}).base("appnrS9SBzzsSH6QZ");
// var base = new Airtable({ apiKey: apiKey }).base('appnrS9SBzzsSH6QZ');

// const data = [
//   {
//     english: "apple",
//     german: "Apfel",
//     type: "noun",
//     article: "der",
//     plural: "Äpfel",
//   },
//   {
//     english: "house",
//     german: "Haus",
//     type: "noun",
//     article: "das",
//     plural: "Häuser",
//   },
//   {
//     english: "order",
//     german: "Bestellen",
//     type: "others",
//   },
//   // Add more flashcard data as needed
// ];

var data = [];

function App() {
  // random starting index
  const [flashcardIndex, setFlashcardIndex] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [pluralValue, setPluralValue] = useState("");
  const [selectedArticle, setSelectedArticle] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [incorrectAttempt, setIncorrectAttempt] = useState(false);

  // var airtable_data = [];
  const [dataReady, setDataReady] = useState(false);
  const handleDataReady = () => {
    if (!dataReady) {
      setDataReady(true);
      // random starting index
      setFlashcardIndex(Math.floor(Math.random() * data.length));
      console.log(data.length);
    }
  };

  // debug state
  const [debug, setDebug] = useState(false);
  const handleDebug = () => {
    setDebug(!debug);
  };

  const handlePluralChange = (event) => {
    setPluralValue(event.target.value);
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleArticleSelection = (article) => {
    setSelectedArticle(article);
  };

  const handleCheckAnswer = () => {
    const { german, article, type, plural } = data[flashcardIndex];

    if (type == "noun") {
      // if german exist, check german and article and plural
      var correctSingular = inputValue.trim() === german;
      var correctPlural = pluralValue.trim() === plural;

      var germanExist = german.trim() !== "";
      var pluralExist = plural.trim() !== "";

      if (
        germanExist ? correctSingular : true &&
          pluralExist ? correctPlural : true &&
        selectedArticle.toLowerCase() === article.toLowerCase()
      ) {
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

    setInputValue("");
    setPluralValue("");
    setSelectedArticle("");
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
  };

  base("vocab")
    .select({
      maxRecords: 999,
      view: "Grid view",
    })
    .eachPage(
      function page(records, fetchNextPage) {
        // This function (`page`) will get called for each page of records.

        records.forEach(function (record) {
          data.push(record.fields);
        });

        console.log("Retrieved");
        // To fetch the next page of records, call `fetchNextPage`.
        // If there are more records, `page` will get called again.
        // If there are no more records, `done` will get called.
        fetchNextPage();
      },
      function done(err) {
        // console.log(airtable_data);
        console.log("Data ready");
        handleDataReady();
        // data = airtable_data;

        if (err) {
          console.error(err);
          return;
        }

        return;
      }
    );

  return (
    <Container size="md">
      {/* Add a loading screen when data not ready */}
      {!dataReady && (
        <Box
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
          }}
        >
          <Text>Loading...</Text>
        </Box>
      )}

      {data.length > 1 && (
        <Paper padding="lg" shadow="sm" style={{ minHeight: "300px" }}>
          {/* debug switch */}
          <Box my="sm" style={{ display: "flex", justifyContent: "flex-end" }}>
            <Switch
              checked={debug}
              onChange={handleDebug}
              style={{ marginBottom: "16px" }}
              label="Show debug info"
            />
          </Box>

          <Flashcard data={data[flashcardIndex]} mode="english" />

          <TextInput
            placeholder="Enter your answer..."
            value={inputValue}
            onChange={handleInputChange}
            style={{ marginTop: "16px" }}
          />

          {/* no article for non-nouns */}
          {data[flashcardIndex].type == "noun" && (
            <>
              <Box style={{ marginTop: "16px" }}>
                <Text>Select the article:</Text>
                <Box>
                  {["der", "die", "das"].map((article) => (
                    <Button
                      key={article}
                      onClick={() => handleArticleSelection(article)}
                      variant={
                        selectedArticle === article ? "outline" : "filled"
                      }
                      style={{ marginRight: "8px", marginTop: "8px" }}
                    >
                      {article}
                    </Button>
                  ))}
                </Box>
              </Box>

              <Box style={{ marginTop: "16px" }}>
                {/* plural for nouns */}
                <TextInput
                  placeholder="Enter the plural form or leave blank if there's no plural form."
                  value={pluralValue}
                  onChange={handlePluralChange}
                  style={{ marginTop: "16px" }}
                />
              </Box>
            </>
          )}
          <Button onClick={handleCheckAnswer} style={{ marginTop: "8px" }}>
            Check Answer
          </Button>
          {incorrectAttempt && (
            <Box style={{ marginTop: "16px" }}>
              {/* button that switch between show and hide asnwers */}
              <Button
                onClick={showAnswer ? handleHideAnswer : handleShowAnswer}
                style={{ marginTop: "8px", marginBottom: "16px" }}
              >
                {showAnswer ? "Hide Answer" : "Show Answer"}
              </Button>

              {showAnswer && (
                <Text>
                  {" "}
                  {data[flashcardIndex].article} {data[flashcardIndex].german}
                </Text>
              )}
            </Box>
          )}
          {incorrectAttempt && !correct && (
            <Text align="center" style={{ marginTop: "16px", color: "red" }}>
              Sorry, that's incorrect. Please try again.
            </Text>
          )}
          {correct && (
            <Box>
              {correct && (
                <Text
                  align="center"
                  style={{ marginTop: "16px", marginBottom: "8px" }}
                >
                  Congratulations! You're correct!
                </Text>
              )}
              <Button onClick={handleNextCard}>Next Card</Button>
            </Box>
          )}

          {debug && (
            <Paper w="100%" radius="md" px='md' py='md' bg="gray.8" shadow="md">
              <Flex justify="center" align="center" direction="column" gap="sm">
                {/* debug info */}
                <Flex justify="center" align="center" direction="column">
                  <Text
                    size="lg"
                    td="underline"
                    fw={700}
                    align="center"
                    style={{ marginTop: "16px", fontFamily: 'Courier New, monospace' }}
                  >
                    Debug Info
                  </Text>
                </Flex>

                <Group grow gap='md'>
                  <DebugItem title="Input Value" value={inputValue} />
                  <Text style={{ fontFamily: 'Courier New, monospace' }}>Selected Article: {selectedArticle}</Text>
                  <Text style={{ fontFamily: 'Courier New, monospace' }}>Type: {data[flashcardIndex].type}</Text>
                </Group>
                <Group grow gap='md'>
                  <Text style={{ fontFamily: 'Courier New, monospace' }}>Show Answer: {showAnswer.toString()}</Text>
                  <Text style={{ fontFamily: 'Courier New, monospace' }}>Correct: {correct.toString()}</Text>
                  <Text style={{ fontFamily: 'Courier New, monospace' }}>
                    Incorrect Attempt: {incorrectAttempt.toString()}
                  </Text>
                </Group>
              </Flex>
            </Paper>
          )}
        </Paper>
      )
      }
    </Container >
  );
}

export default App;
