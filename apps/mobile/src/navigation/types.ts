export type TabParamList = {
  Home: undefined;
  Tasks: undefined;
  CaptureStub: undefined;
  Bugs: undefined;
  Search: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  MainTabs: undefined;
  TaskDetail: { id: string };
  BugDetail: { id: string };
  CaptureModal: { initialMode?: 'task' | 'bug' | 'voice' };
  DevGallery?: undefined;
};
