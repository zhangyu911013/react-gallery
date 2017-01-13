require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';
import ReactDOM from 'react-dom';

let imageData = require('../data/image.json');

imageData = (function genImgUrl(imageArr) {
  for (var i = 0, len = imageArr.length; i < len; i++) {
    var entry = imageArr[i];
    entry.url = require('../data/' + entry.filename);
  }
  return imageArr;
}(imageData));

class GalleryByReact extends React.Component {
  render() {
    return (
      <section className="stage">
        <section className="img-sec"></section>
        <nav className="controller-nav"></nav>
      </section>
    );
  }
}
GalleryByReact.defaultProps = {};
ReactDOM.render(<GalleryByReact/>, document.getElementById('content'));

export default GalleryByReact;
