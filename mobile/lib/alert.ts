import { Alert, Platform } from 'react-native';

export function showAlert(title: string, message?: string, onOk?: () => void) {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
    onOk?.();
    return;
  }

  if (onOk) {
    Alert.alert(title, message, [{ text: 'OK', onPress: onOk }]);
  } else {
    Alert.alert(title, message);
  }
}
