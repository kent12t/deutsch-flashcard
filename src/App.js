/* eslint-disable react/no-unescaped-entities */
import React, { useState } from "react";
import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Stack,
  Text,
  TextInput,
  Paper,
  Image
} from "@mantine/core";
import { Flashcard } from "./components";

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
  const [shownAnswer, setShownAnswer] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [incorrectAttempt, setIncorrectAttempt] = useState(false);

  // const [gameState, setGameState] = useState("new");
  // // states: new, correct, incorrect, incorrect showed answer

  // const handleGameState = (state) => {
  //   setGameState(state);
  // };

  const [dataReady, setDataReady] = useState(false);
  const handleDataReady = () => {
    if (!dataReady) {
      setDataReady(true);
      // random starting index
      setFlashcardIndex(Math.floor(Math.random() * data.length));
      console.log(data.length);
    }
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
      var correctSingular = inputValue === german;
      var correctPlural = pluralValue === plural;

      var germanExist = german !== "";
      var pluralExist = plural !== "";

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
      if (inputValue.toLowerCase() === german.toLowerCase()) {
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
    setShownAnswer(false);
    setCorrect(false);
    setIncorrectAttempt(false);
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
    setShownAnswer(true);
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
    <Container px='5vw' h='100vh' size="md">
      <Paper py='md' w='100%' justify='center'>
        <Text size="xl" fw={900} variant="gradient" gradient={{ from: 'pink.8', to: 'grape.4', deg: 0 }} align='center' style={{ textShadow: '-2px -2px #eee' }}>
          DEUTSCH FLASHCARDS
        </Text>
      </Paper>

      {/* Add a loading screen when data not ready */}
      {!dataReady && (
        <Box
          h='90%'
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text size="3rem" fw={600} c='pink'>Loading...</Text>
        </Box>
      )}

      {/* only run when the data exists */}
      {data.length > 1 && (
        <Stack h='100vh' py='lg' gap="lg" style={{ minHeight: "300px" }}>

          <Flashcard data={data[flashcardIndex]} mode="english" />

          {/* Answer Box */}

          <Flex w="100%" justify="center" align="center" direction="column" gap="md">

            {/* article select -> no article for non-nouns */}
            {data[flashcardIndex].type == "noun" && (

              <Flex w='100%' justify="center" align="center" direction="row" gap="md">

                {["der", "die", "das"].map((article) => (
                  <Button
                    size="lg"
                    radius="md"
                    key={article}
                    onClick={() => handleArticleSelection(article)}
                    variant={
                      selectedArticle === article ? "outline" : "filled"
                    }
                  >
                    {article}
                  </Button>
                ))}

              </Flex>

            )}

            <Flex w="100%" justify='stretch' align='center' direction='column' gap="md">

              {/* answer input */}

              <TextInput
                w='100%'
                size="lg"
                radius="md"
                placeholder="Answer (case-sensitive)"
                value={inputValue}
                onChange={handleInputChange}
              />

              {/* plural for nouns */}
              {data[flashcardIndex].type == "noun" &&

                <TextInput
                  w='100%'
                  size="lg"
                  radius="md"
                  placeholder="Plural or leave blank"
                  value={pluralValue}
                  onChange={handlePluralChange}
                />
              }
            </Flex>
          </Flex>

          {/* check and answer buttons */}

          <Flex justify="center" align="center" direction="row" gap="lg">

            {correct || shownAnswer ?
              <Button size="lg" color="green.7" onClick={handleNextCard}>
                Next Card
              </Button> :
              <Button size="lg" onClick={handleCheckAnswer}>
                Check Answer
              </Button>

            }

            <Button
              variant={
                showAnswer ? "outline" : "filled"
              }
              disabled={correct}
              size="lg"
              onClick={showAnswer ? handleHideAnswer : handleShowAnswer}
              color="yellow.8"
            >
              {showAnswer ? "Hide Answer" : "Show Answer"}
            </Button>
          </Flex>


          <Flex justify="center" align="center" direction="column" gap="md">
            {correct && !shownAnswer && (
              <Badge size="xl" variant="light" color="green">
                You're correct!
              </Badge>

            )}

            {shownAnswer && (
              <Badge size="xl" variant="light" color="orange">
                Nice try
              </Badge>
            )}

            {incorrectAttempt && !correct && (
              <Badge size="xl" variant="light" color="red">
                Try again
              </Badge>
            )}

            {/* model answer */}
            {showAnswer && (
              <Paper w='100%' radius="md" px='xl' py='xl' bg="gray.8" shadow="md">
                <Text size="sm" fw={700} c="pink" align='center'>
                  ANSWER:
                </Text>

                <Text size="xl" fw={300} c="pink" align='center'>
                  {data[flashcardIndex].article} {data[flashcardIndex].german ? data[flashcardIndex].german : ''} {data[flashcardIndex].german && data[flashcardIndex].plural && (' / ')} {data[flashcardIndex].plural ? `${data[flashcardIndex].plural}` : ''}
                </Text>
              </Paper>
            )}
          </Flex>
        </Stack>
      )
      }

      <Flex w='100%' justify="center" align="center" direction="row" gap="md" style={{ position: "absolute", left: '0px', bottom: '32px' }}>
        <Image h={32} w={32}
          fit="contain" alt="logo" src="./assets/kent.png" />
        <Text size="sm" fw={600} variant="gradient" gradient={{ from: 'pink.5', to: 'grape.2', deg: 0 }}>
          Created by Kent
        </Text>
      </Flex>
    </Container >
  );
}

export default App;
