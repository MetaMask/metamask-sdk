import { View, Text } from 'react-native';
import { Button } from 'react-native-paper';
import React from 'react';

export const First = () => {
  return (
    <View>
      <Text>Testing cross-platform component to validate the library</Text>
      <Button
        mode="outlined"
        onPress={() => {
          console.log(`ok I was pressed`);
        }}
      >
        test
      </Button>
      <Text>hello</Text>
    </View>
  );
};
