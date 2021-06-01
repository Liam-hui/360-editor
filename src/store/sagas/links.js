import { put } from 'redux-saga/effects';
import store from '@/store';
import { createObject } from '@/components/Panorama'

import LinksActions from '@/store/ducks/links';

const THREE = window.THREE;

// export function* initInfosRequest( { data } ) {

//   let infos = {};
//   let nextId = 0;

//   for (const item of data) {

//     const position = new THREE.Vector3(item.position.x, item.position.y, item.position.z)

//     const info = createInfo({
//       position,
//       text: item.text,
//       scene: item.scene
//     })

//     infos[nextId] = info;

//     nextId ++;
//   }

//   yield put(InfosActions.initInfos( infos ));
// }

export function* addLinkRequest( { position, targetId } ) {
  try {

    const link = createLink( { position, targetId } );

    yield put( LinksActions.addLink( link ) );

  } catch (error) {
    // console.log(error);
  }
}

const createLink = ( { position, targetId, scene } ) => {

  const object = createObject( position );

  if ( scene == undefined )
    scene = store.getState().scenes.currentId;

  const panorama = store.getState().scenes.data[ scene ].panorama;
  panorama.add(object);

  const link = {  
    object: object,
    targetId: targetId,
    scene: scene,
  }

  return link;
 
}