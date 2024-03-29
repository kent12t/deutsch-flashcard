import React from "react";
import PropTypes from "prop-types";
import { Flex, Paper, Text, Badge } from "@mantine/core";

function Flashcard({ data, mode }) {
  // different data type has different color
  let typeColor = "lime.3";
  if (data.type === "noun") {
    typeColor = "blue.9";
  } else if (data.type === "verb") {
    typeColor = "grape." + (9 - 2 * parseInt(data.verbType));
  } else if (data.type === "adjective") {
    typeColor = "yellow.4";
  }

  let quizColor = "orange." + parseInt(data.quiz) % 10;

  return (
    <>
      <Paper radius="md" px='md' py='lg' bg="gray.8" shadow="md">
        <Flex justify="center" align="center" direction="row" gap='lg'>

          <Flex w='80%' justify="center" align="center">

            {/* display the english word */}
            <Text
              align="center"
              size='2rem'
              variant="gradient"
              gradient={{ from: 'pink', to: 'grape.2', deg: 0 }}
              fw={700}
              style={{ lineHeight: "1.5" }}
            >
              {mode === "english" ? data.english : data.german}
              {/* jdsakjdhakjdsada shsdkalshdljakdsadas */}
            </Text>

            {/* display the german words */}
            {mode === "german" && data.type === "noun" && (
              <Text align="center">
                {data.article} {data.german}
              </Text>
            )}
          </Flex>

          {/* word type */}
          <Flex justify="center" align="center" direction="column" gap="md">
            <Badge px="md" py="md" autoContrast size="md" color={typeColor}>
              {data.type} {data.verbType && `(${data.verbType})`}
            </Badge>
            <Badge px="md" py="md" autoContrast size="md" color={quizColor}>
              Quiz {data.quiz}
            </Badge>
          </Flex>

        </Flex>
      </Paper>
    </>
  );
}

Flashcard.propTypes = {
  data: PropTypes.shape({
    english: PropTypes.string.isRequired,
    german: PropTypes.string,
    type: PropTypes.oneOf(["noun", "verb", "adjective", "others"]).isRequired,
    verbType: PropTypes.oneOf(["1", "2", "3"]),
    article: PropTypes.string,
    plural: PropTypes.string,
    quiz: PropTypes.string,
  }).isRequired,
  mode: PropTypes.oneOf(["english", "german"]).isRequired,
};

export default Flashcard; // This line exports the Flashcard component as default
