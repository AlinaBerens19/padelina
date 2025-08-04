import React from 'react';
import { Text, View } from 'react-native';

const Placeholder = (name: string) => () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 20 }}>{name} Screen</Text>
  </View>
);

export default Placeholder;
