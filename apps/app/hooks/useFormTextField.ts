import { useCallback, useState } from 'react';

export function useFormTextField(initialValue = '') {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');

  const onChangeText = useCallback((nextValue: string) => {
    setValue(nextValue);
    setError((currentError) => (currentError ? '' : currentError));
  }, []);

  const clearError = useCallback(() => {
    setError('');
  }, []);

  const validateRequired = useCallback(
    (message: string) => {
      if (value.trim().length > 0) {
        setError((currentError) => (currentError ? '' : currentError));
        return true;
      }

      setError(message);
      return false;
    },
    [value],
  );

  return {
    value,
    trimmedValue: value.trim(),
    error,
    setValue,
    setError,
    onChangeText,
    clearError,
    validateRequired,
  };
}
