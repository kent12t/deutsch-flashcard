import React, { useState } from "react";
import PropTypes from "prop-types";
import { Paper, Text, TextInput } from "@mantine/core";

function Flashcard({ data, mode }) {
  const [userInput, setUserInput] = useState("");

  const handleChange = (event) => {
    setUserInput(event.target.value);
  };

  return (
    <Paper padding="md" style={{ marginBottom: "16px" }}>
      <Text
        align="center"
        size="xl"
        c="pink"
        fw={700}
        style={{ marginBottom: "16px" }}
      >
        {mode === "english" ? data.english : data.german}
      </Text>
      {mode === "german" && data.type === "noun" && (
        <Text align="center" style={{ marginBottom: "8px" }}>
          {data.article} {data.german}
        </Text>
      )}
      {mode === "german" && (
        <TextInput
          placeholder="Type your answer..."
          value={userInput}
          onChange={handleChange}
          fullWidth
        />
      )}
    </Paper>
  );
}

Flashcard.propTypes = {
  data: PropTypes.shape({
    english: PropTypes.string.isRequired,
    german: PropTypes.string.isRequired,
    type: PropTypes.oneOf(["noun", "verb", "adjective", "others"]).isRequired,
    article: PropTypes.string,
    plural: PropTypes.string,
    quiz: PropTypes.string,
  }).isRequired,
  mode: PropTypes.oneOf(["english", "german"]).isRequired,
};

export default Flashcard; // This line exports the Flashcard component as default
