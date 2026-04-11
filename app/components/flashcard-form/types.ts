export type EditorSection = 'question' | 'answer' | 'options';

export type OptionField = {
  id: string;
  text: string;
  isCorrect: boolean;
};
