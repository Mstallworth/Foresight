export type ChatKitOptions = {
  theme: { appearance: 'light'; radius: 'pill'; density: 'normal'; fonts: string[] };
  composer: { placeholder: string; attachments: boolean };
  startScreen: { greeting: string };
};

export const chatKitOptions: ChatKitOptions = {
  theme: {
    appearance: 'light',
    radius: 'pill',
    density: 'normal',
    fonts: ['OpenAI Sans', 'Inter', 'system-ui'],
  },
  composer: {
    placeholder: 'Describe a future to explore…',
    attachments: true,
  },
  startScreen: {
    greeting: 'What future would you like to explore?',
  },
};
