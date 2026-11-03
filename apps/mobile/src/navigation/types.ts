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
  StickyBoard: undefined;
  CaptureModal: { initialMode?: 'task' | 'bug' | 'voice' | 'sticky' };
  Settings: undefined;
  PendingSync: undefined;
  Notifications: undefined;
  DevGallery?: undefined;
  FoundationGallery?: undefined;
};
