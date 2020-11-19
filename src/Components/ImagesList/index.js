import './style.css';
import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from "react-redux";
import store from '../../store';
import Slider from '../../Components/Slider';
import AddImage from '../../Components/AddImage';


function ImagesList() {

  const mode = useSelector(state => state.mode);
  const display = useSelector(state => state.display);
  const images = useSelector(state => state.images);
  const imageSelected = useSelector(state => state.imageSelected);

  let WIDTH,HEIGHT;
  if(display=='smallLand') {WIDTH=150;HEIGHT='100%'}
  else {WIDTH='100%';HEIGHT='100%';}
  let containerStyle = {width:WIDTH,height:HEIGHT}

  return (
    <div className="imagesListContainer" style={containerStyle}>

      {mode=='admin'&&display=='large'?
        <>
          <div style={{width:50}}/>
          <AddImage/>
        </>
        :null
      }

      <Slider vertical={display=='smallLand'} images={images} selectedId={imageSelected} selectedText={'圖片編輯中'} selectItem={(id)=>store.dispatch({type:'SELECT_IMAGE',id:id})} 
        deleteItem={(id)=>{
            if(imageSelected==id) {
              let index = images.findIndex(image => image.id == imageSelected);
              if(index<images.length-1) index += 1;
              else index -= 1;
              if(index==-1)  store.dispatch({type:'SELECT_IMAGE',id: -1});
              else store.dispatch({type:'SELECT_IMAGE',id:images[index].id});
            }
            store.dispatch({type:'DELETE_IMAGE',id:id});
          }
        }
      />
  </div>
  );
}

export default ImagesList;
