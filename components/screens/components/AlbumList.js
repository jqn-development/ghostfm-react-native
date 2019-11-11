import React, {useState, useEffect} from 'react';
import {Text, ActivityIndicator} from 'react-native-paper';
import useApi from '../../misc/hooks/useApi';
import {
  Dimensions,
  View,
  StyleSheet,
  ImageBackground,
  Image,
} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import {FALLBACK_ALBUM_COVER} from '../../misc/Utils';

const {width, height} = Dimensions.get('window');

export const AlbumList = props => {
  const {isLoading, getAlbumsByArtistName} = useApi();
  const [albums, setAlbums] = useState();
  const {artistName} = props;

  useEffect(() => {
    getAlbumsByArtistName(artistName).then(results => {
      setAlbums(results);
    });
  }, [artistName]);

  return (
    <>
      {isLoading && <ActivityIndicator size="small" color="#00ff00" />}
      <View style={styles.container}>
        {albums &&
          albums.map((item, index) => {
            return (
              <TouchableOpacity style={styles.surface} key={index}>
                <View style={styles.imgContainer}>
                  <ImageBackground
                    source={{uri: item.strAlbumThumb || FALLBACK_ALBUM_COVER}}
                    style={{
                      width: '100%',
                      height: '100%',
                    }}
                    resizeMode={'center'}></ImageBackground>
                </View>
                <View>
                  <Text numberOfLines={2} style={styles.title}>
                    {item.strAlbum}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  imgContainer: {
    width: '100%',
    height: 200,
  },
  surface: {
    padding: 6,
    height: 250,
    width: width / 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  title: {
    height: 'auto',
    textAlign: 'center',
    backgroundColor: '#111111e1',
    paddingHorizontal: 5,
    paddingVertical: 6,
    borderRadius: 6,
  },
});