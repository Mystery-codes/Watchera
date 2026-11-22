# Watchera Mobile

A React Native app built with Expo. It uses the Watchera web API for catalog data and playback, while saved titles stay on the device.

## Run

```sh
cd mobile
npm install
npm start
```

Scan the QR code with Expo Go, or run `npm run android` / `npm run ios` with the corresponding simulator or device tooling installed.

The app defaults to `https://watchera.net`. To use a local Next.js server, create `mobile/.env` with `EXPO_PUBLIC_WATCHERA_API_URL=http://YOUR_COMPUTER_LAN_IP:3000`. A physical phone cannot reach the development computer through `localhost`.

Playback requires the deployed server's existing `PLEXHD_API_KEY` and `PLEXHD_STREAM_TOKEN` configuration. Those credentials are never included in the mobile bundle.
