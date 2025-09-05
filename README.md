# TodoList (React Native + Firebase)

A simple iOS app built using React Native that allows users to keep track of any to-do items. Features authentication so that users can sign up/sign in, and stores every person's to do list with their account (uses Firebase auth and Firestore)

To get started with this project, please clone it.

---

## iOS setup

### Prereqs
- macOS with **Xcode 15+**, **CocoaPods**, **Node 20+**, and yarn or npm 
- Firebase project
    - after creating your own project, add iOS app (with your own bundle id)
    - enable email/password sign in
    - download `GoogleService-Info.plist`, place it in the root directory of iOS in xCode, and make sure it's included in Copy Bundle Resources for the `TodoList` target
        - if you don't know where to find this, open `ios/TodoList.xcworkspace` in Xcode, and under signing & capabilities, set a unique bundle identifier

### Installation
```
yarn install (or npm install)
cd ios
pod install --repo-update
cd ..
```

### Run (on simulator)
```
npx react-native run-ios
```

### Run (on physical iPhone): release build
1. Ensure your iPhone is in developer mode (settings -> privacy & security -> developer mode -> on)
2. Plug in your iPhone to your computer
3. Open `ios/TodoList.xcworkspace` in Xcode, and under signing & capabilities, select your team (can be your personal apple account)
4. run `npx react-native run-ios --device "<Your iPhone Name>" --mode Release`
5. Wait for build and installation to finish
6. Trust the developer (settings -> general -> vpn & device management -> developer app -> trust)
7. Use the application locally!

