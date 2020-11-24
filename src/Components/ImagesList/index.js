import './style.css';
import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from "react-redux";
import store from '../../store';
import Slider from '../../Components/Slider';
import AddImage from '../../Components/AddImage';

import {Services} from '../../services';


function ImagesList() {

  const status = useSelector(state => state.status);
  const display = useSelector(state => state.display);
  const images = useSelector(state => state.images);
  const imageSelected = useSelector(state => state.imageSelected);

  let WIDTH,HEIGHT;
  if(display=='smallLand') {WIDTH=150;HEIGHT='100%'}
  else {WIDTH='100%';HEIGHT='100%';}
  let containerStyle = {width:WIDTH,height:HEIGHT}

  return (
    <div className="imagesListContainer" style={containerStyle}>

      {status.mode=='admin'&&display=='large'?
        <AddImage border={true}/>
        :null
      }

      <Slider canDelete={status.mode=='admin'} border={true} vertical={display=='smallLand'} images={images} selectedId={imageSelected} selectedText={'圖片編輯中'} selectItem={(id)=>store.dispatch({type:'SELECT_IMAGE',id:id})} 
        deleteItem={(id)=>{
          const deleteImage = () => {
            if(imageSelected==id) {
              let index = images.findIndex(image => image.id == imageSelected);
              if(index<images.length-1) index += 1;
              else index -= 1;
              if(index==-1)  store.dispatch({type:'SELECT_IMAGE',id: -1});
              else store.dispatch({type:'SELECT_IMAGE',id:images[index].id});
            }
            store.dispatch({type:'DELETE_IMAGE',id:id});
          }

          Services.adminDeletePhoto(id,deleteImage);
        }}
      />
  </div>
  );
}

export default ImagesList;
