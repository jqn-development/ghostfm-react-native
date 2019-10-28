import React, {useEffect, memo} from 'react';
import TrackPlayer from 'react-native-track-player';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/Feather';

import {StyleSheet, View, TouchableWithoutFeedback} from 'react-native';
import {Text} from 'react-native-paper';
import {useStore} from 'easy-peasy';
import useMusicPlayer from '../../../misc/hooks/useMusicPlayer';
import {
  useTrackPlayerEvents,
  TrackPlayerEvents,
} from 'react-native-track-player/index';
import {FALLBACK_MP3} from '../../../misc/Utils';
import useApi from '../../../misc/hooks/useApi';

const events = [
  TrackPlayerEvents.PLAYBACK_TRACK_CHANGED,
  TrackPlayerEvents.PLAYBACK_QUEUE_ENDED,
];

const MiniPlayer = memo(({onPress}) => {
  //const progress = useProgress(1000);

  const {
    playerState,
    isPlaying,
    handlePlayPause,
    updateMetadata,
  } = useMusicPlayer();
  const {getMP3} = useApi();

  const store = useStore();

  useEffect(() => {
    setupPlayer();
  }, []);

  useTrackPlayerEvents(events, event => {
    if (event.type === TrackPlayerEvents.PLAYBACK_TRACK_CHANGED) {
      console.log('track changed', event);
      TrackPlayer.getCurrentTrack().then(currentId => {
        if (!event.nextTrack || currentId != event.nextTrack) {
          return;
        }
        TrackPlayer.getTrack(currentId).then(currentTrack => {
          if (currentTrack.url == FALLBACK_MP3) {
            console.log('stopped');
            TrackPlayer.stop();
            getMP3(`${currentTrack.artist} ${currentTrack.title}`).then(
              mp3Url => {
                const trackData = {
                  id: currentId,
                  url: mp3Url[0],
                  title: currentTrack.title,
                  artist: currentTrack.artist,
                };
                let playerState = store.getState().player;
                let playlist = playerState.queue.slice(0);
                let index = playlist.findIndex(track => track.id === currentId);
                playlist.splice(index, 1, trackData);

                TrackPlayer.reset().then(() => {
                  TrackPlayer.add(playlist).then(() => {
                    updateMetadata(trackData);
                    TrackPlayer.skip(currentId).then(() => {
                      TrackPlayer.play();
                    });
                  });
                });
              },
            );
          }
        });
      });
    }
    if (event.type === TrackPlayerEvents.PLAYBACK_QUEUE_ENDED) {
      //console.log('queue ended', event);
    }
  });

  const setupPlayer = async () => {
    await TrackPlayer.setupPlayer();
    TrackPlayer.updateOptions({
      stopWithApp: false,
      capabilities: [
        TrackPlayer.CAPABILITY_PLAY,
        TrackPlayer.CAPABILITY_PAUSE,
        TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
        TrackPlayer.CAPABILITY_SKIP_TO_PREVIOUS,
        TrackPlayer.CAPABILITY_STOP,
      ],
      compactCapabilities: [
        TrackPlayer.CAPABILITY_PLAY,
        TrackPlayer.CAPABILITY_PAUSE,
      ],
    });
  };
  return (
    <TouchableWithoutFeedback>
      <View style={styles.container}>
        <MaterialIcon name={'heart'} size={24} color={'#fff'} />
        <View
          style={{
            flexDirection: 'column',
            flex: 1,
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text numberOfLines={1} style={styles.trackTitle}>
            {playerState.current.title}
          </Text>
          <Text numberOfLines={1} style={styles.artistName}>
            {playerState.current.artist}
          </Text>
        </View>
        <MaterialIcon
          style={{marginRight: '5%'}}
          name={isPlaying ? 'pause' : 'play'}
          size={32}
          color={'#fff'}
          onPress={handlePlayPause}
        />
        <Icon name="chevron-up" color="white" size={24} onPress={onPress} />
      </View>
    </TouchableWithoutFeedback>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxHeight: 68,
    backgroundColor: '#272829',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  trackTitle: {maxWidth: '80%'},
  artistName: {fontSize: 12, marginTop: 1},
});

export default MiniPlayer;