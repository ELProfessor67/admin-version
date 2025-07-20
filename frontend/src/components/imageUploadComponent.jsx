import React from 'react';

const ImageUpload = ({
  title,
  imageUrl,
  onImageChange,
  onImageRemove,
  errorMsg,
  required,
  recommended,
}) => {
  return (
    <div className="form-group">
      <label>
        {title} {required && <span>*</span>}
      </label>
      {recommended && <span className="text-muted ml-1">{recommended}</span>}
      
      {imageUrl ? (
        <div className="d-flex align-items-center mb-2">
          <img src={imageUrl} alt="preview" className="img-thumbnail" style={{ height: '100px' }} />
          <button type="button" className="btn btn-danger btn-sm ml-2" onClick={onImageRemove}>
            Remove
          </button>
        </div>
      ) : (
        <input type="file" className="form-control" onChange={onImageChange} accept="image/*" />
      )}
      
      {errorMsg && <div className="text-danger">{errorMsg}</div>}
    </div>
  );
};

export default ImageUpload; 