import React, { memo } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { List, TouchableRipple, Text } from "react-native-paper";
import { StyleSheet, View } from "react-native";
import useMusicPlayer from "../../misc/hooks/useMusicPlayer";
import useApi from "../../misc/hooks/useApi";
import TrackPlayer from "react-native-track-player";

const TrackItem = memo(({ item, trackList, openSheet = null }) => {
  const { playTrack, updateMetadata, setQueue } = useMusicPlayer();
  const { getMP3 } = useApi();

  const handlePress = (artistName, trackName) => {
    console.log("searching ", `${artistName} ${trackName}`);
    getMP3(`${artistName} ${trackName}`).then(mp3Url => {
      const trackData = {
        id: item.id,
        url: mp3Url[0],
        title: trackName,
        artist: artistName
      };
      console.log("playing url ", mp3Url[0]);
      let playlist = trackList.slice(0);
      let index = playlist.findIndex(track => track.id === item.id);
      playlist.splice(index, 1, trackData);

      TrackPlayer.reset().then(() => {
        TrackPlayer.add(playlist).then(() => {
          updateMetadata(trackData);
          TrackPlayer.skip(item.id).then(() => {
            playTrack(trackData);
            TrackPlayer.play();
          });
        });
      });

      setQueue(playlist);
    });
  };

  return (
    <View style={styles.itemContainer}>
      <List.Item
        style={styles.item}
        title={item.title}
        onPress={() => handlePress(item.artist, item.title)}
        left={props => {
          return (
            <React.Fragment>
              <Text style={styles.itemNumber}>{item.id - 10}</Text>
            </React.Fragment>
          );
        }}
      />
      <TouchableOpacity onPress={() => openSheet && openSheet(item)}>
        <List.Icon icon='dots-vertical' />
      </TouchableOpacity>
    </View>
  );
});
const styles = StyleSheet.create({
  item: {
    width: "85%"
  },
  itemNumber: {
    alignSelf: "center",
    paddingRight: 8
  },
  itemContainer: {
    borderWidth: 0.2,
    borderColor: "#1a1a1b",
    flexDirection: "row"
  }
});

export default TrackItem;
