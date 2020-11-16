import './App.css';
import './animate.css';
import React, { useState, useEffect } from 'react';

import Editor from './Components/Editor';
import Slider from './Components/Slider';
import UserLeftPanel from './Components/UserLeftPanel';
import AddImage from './Components/AddImage';

import pic1 from './temp_files/pic1.png';
import pic2 from './temp_files/pic2.png';
import pic3 from './temp_files/pic3.png';
import pic4 from './temp_files/pic4.png';
import pic5 from './temp_files/pic5.png';
import pic6 from './temp_files/pic6.png';

const temp_images = [
  pic1,
  pic2,
  pic3,
  pic4,
  pic5,
  pic6
]

function App() {

  const [imageSelected,setImageSelected] = useState(-1);
  const [screenWidth,setScreenWidth] = useState(window.screen.width);

  window.addEventListener("resize", ()=>{
    setScreenWidth(window.screen.width);
  });


  return (
    <div className="appUserContainer">
      <UserLeftPanel/>
      <div style={{flex:1}} className='ColumnRevContainer'>
        <div className="bottomRow">
          {screenWidth>768? <AddImage/> :null}
          <Slider images={temp_images} imageSelected={imageSelected} setImageSelected={setImageSelected}/>
        </div>

        <Editor image={imageSelected!=-1?temp_images[imageSelected]:null}/>

      </div>
    </div>
  );
}

export default App;