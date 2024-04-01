/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from "react";
import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  MultiSelect,
  Stack,
  Text,
  TextInput,
  Paper,
  Image
} from "@mantine/core";
import { Flashcard } from "./components";

import Airtable from "airtable";

const base = new Airtable({
  apiKey:
    "pat1JpGAPoqMI6wGK.766a65c9a30a8979775e623823e7ab97923eebcbb6f3788eeca62c7ebca14ada",
}).base("appnrS9SBzzsSH6QZ");

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

  // Initialize rawData and data as state variables
  const [rawData, setRawData] = useState([]);
  const [data, setData] = useState([]);
  const [dataReady, setDataReady] = useState(false);


  const quizOptions = [
    "1", "2", "3", "4"
  ];

  // Load your data with useEffect on component mount
  useEffect(() => {
    base("vocab")
      .select({ maxRecords: 999, view: "Grid view" })
      .eachPage(
        function page(records, fetchNextPage) {
          // This function (`page`) will get called for each page of records.
          const newRecords = records.map((record) => record.fields);

          // Set rawData with the new records
          setRawData((existingRecords) => [...existingRecords, ...newRecords]);
          fetchNextPage();
        },
        function done(err) {
          if (err) {
            console.error(err);
            return;
          }

          // Indicate loading is done by setting dataReady to true
          setDataReady(true);
          console.log("Data ready: " + rawData.length);
        }
      );
  }, []); // The empty array means this effect runs once on mount

  // useEffect to update 'data' once rawData is populated
  useEffect(() => {
    if (rawData.length > 0) {
      setData(rawData); // Now rawData is guaranteed to be populated
      handleNextCard(); // Move to the next card now that data is ready
    }
  }, [rawData]); // This will run when rawData changes, after data is loaded

  const [selectedQuizzes, setSelectedQuizzes] = useState(quizOptions);

  const handleQuizSelection = (quiz) => {

    if (quiz.length === 0) {
      return;
    }

    setSelectedQuizzes(quiz);

  };

  // useEffect for filtering data when selectedQuizzes changes
  useEffect(() => {
    if (rawData.length > 0) {
      const filteredData = rawData.filter(item => selectedQuizzes.includes(item.quiz));
      setData(filteredData);
      // When filteredData changes, if it's not empty, set the flashcardIndex
      if (filteredData.length > 0) {
        setFlashcardIndex(prevIndex => {
          let newIndex;
          do {
            newIndex = Math.floor(Math.random() * filteredData.length);
          } while (newIndex === prevIndex && data.length > 1); // Also ensure there's more than one card to avoid infinite loop
          return newIndex;
        });
      } else {
        // If there is no data, reset the index to null or initial state
        setFlashcardIndex(null);
      }
    }
  }, [selectedQuizzes, rawData]); // This will run when selectedQuizzes or rawData changes



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

    // console.log(german, article, type, plural)
    // console.log("inputValue: ", inputValue, "pluralValue: ", pluralValue, "selectedArticle: ", selectedArticle)

    if (type == "noun") {
      // if german exist, check german and article and plural
      var correctSingular = inputValue?.trim() === german?.trim();
      var correctPlural = pluralValue?.trim() === plural?.trim();

      // console.log("correctSingular: ", correctSingular, "correctPlural: ", correctPlural)

      // check if german (singular) and plural exists in the database
      var germanExist = german != undefined;
      var pluralExist = plural != undefined;

      // console.log("germanExist: ", germanExist, "pluralExist: ", pluralExist)

      // checks article
      var correctArticle = selectedArticle.toLowerCase() === article.toLowerCase();

      // checks if the existing answers are correct, or else set to null
      var singularCheck = germanExist ? correctSingular : null;
      var pluralCheck = pluralExist ? correctPlural : null;

      // console.log("singularCheck: ", singularCheck, "pluralCheck: ", pluralCheck)

      if (!correctArticle) {
        setIncorrectAttempt(true);
        // console.log("incorrect - article check")
      } else if (singularCheck == null) {
        // case of no singular, only plural check is needed
        if (pluralCheck) {
          setCorrect(true);
          // console.log("correct - plural check only")
        } else {
          setIncorrectAttempt(true);
          // console.log("incorrect - plural check only")
        }
      } else if (pluralCheck == null) {
        // case of no plural, only singular check is needed
        if (singularCheck) {
          setCorrect(true);
          // console.log("correct - singular check only")
        } else {
          setIncorrectAttempt(true);
          // console.log("incorrect - singular check only")
        }
      } else if (singularCheck != null && pluralCheck != null && pluralCheck && singularCheck) {
        // if neither singular nor plural is null, check both and also article
        setCorrect(true);
        // console.log("correct - both singular and plural check")
      } else {
        // else if any of the checks fail, set incorrect attempt
        setIncorrectAttempt(true);
        // console.log("incorrect - both singular and plural check")
      }


    } else {
      // if not noun, only check the input value, no plural or article
      if (inputValue.toLowerCase() === german.toLowerCase()) {
        setCorrect(true);
      } else {
        setIncorrectAttempt(true);
      }
    }
  };

  const handleNextCard = () => {
    // Ensure that there is data before trying to set a new index
    if (data.length > 0) {
      setFlashcardIndex(prevIndex => {
        let newIndex;
        do {
          newIndex = Math.floor(Math.random() * data.length);
        } while (newIndex === prevIndex && data.length > 1); // Also ensure there's more than one card to avoid infinite loop
        return newIndex;
      });
    } else {
      // If there is no data, reset the index to null or initial state
      setFlashcardIndex(null);
    }

    // Resetting other state variables
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



  return (
    <Container px='5vw' h='100vh' size="md" style={{ overflowY: "none" }}>
      <Paper h='5vh' py='md' w='100%' justify='center'>
        <Text size="xl" fw={900} variant="gradient" gradient={{ from: 'pink.8', to: 'grape.4', deg: 0 }} align='center' style={{ textShadow: '-2px -2px #eee' }}>
          DEUTSCH FLASHCARDS
        </Text>
      </Paper>

      {/* Add a loading screen when data not ready */}
      {!dataReady && data.length > 0 && (
        <Box
          h='90vh'
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
      {dataReady & data.length > 0 && (
        <Stack h='90vh' py='lg' gap="lg" style={{ minHeight: "300px", overflowY: "none" }} >



          <Flashcard data={data[flashcardIndex]} mode="english" />

          {/* Answer Box */}

          <MultiSelect
            size="lg"
            checkIconPosition="left"
            data={quizOptions}
            defaultValue={quizOptions}
            value={selectedQuizzes}
            onChange={handleQuizSelection}
            placeholder="Select quizzes"
          />

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

            {shownAnswer && !incorrectAttempt && (
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
                  {data[flashcardIndex].article ? data[flashcardIndex].article : ''} {data[flashcardIndex].german ? data[flashcardIndex].german : ''} {data[flashcardIndex].plural ? ` / ${data[flashcardIndex].plural}` : ''}
                </Text>
              </Paper>
            )}
          </Flex>
        </Stack>
      )
      }

      <Flex w='100%' h='5vh' justify="center" align="center" direction="row" gap="md" style={{ position: "relative", left: '0px', bottom: '32px' }}>
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
