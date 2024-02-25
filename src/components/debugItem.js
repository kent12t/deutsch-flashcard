import React from 'react';
import PropTypes from 'prop-types';
import { Flex, Text } from '@mantine/core';

const DebugItem = ({ title, value }) => {
    return (
        <Flex direction="column" h={50}>
            <Text fw={600} style={{ fontFamily: 'Courier New, monospace' }}>{title}</Text>
            <Text style={{ fontFamily: 'Courier New, monospace' }}>{value ? { value } : 'null'}</Text>
        </Flex>
    );
};

DebugItem.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.any.isRequired,
};

export default DebugItem;
