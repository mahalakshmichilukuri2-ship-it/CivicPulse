

import { useState } from 'react';

function ReportIssue({ onReportSubmit, onCancel }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Validate and preview the selected image
  function handleImageChange(event) {
    const file = event.target.files[0];

    setErrorMessage('');
    setImage('');
    setSelectedFile(null);

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file.');
      event.target.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('Image size must be 2 MB or less.');
      event.target.value = '';
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();

    reader.onload = () => {
      setImage(reader.result);
    };

    reader.onerror = () => {
      setErrorMessage('Could not read the image. Please try again.');
      setImage('');
      setSelectedFile(null);
    };

    reader.readAsDataURL(file);
  }

  // Validate and submit the form
  function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage('');

    // Title validation
    if (!title.trim()) {
      setErrorMessage(
        'Title cannot be empty or contain only spaces.'
      );
      return;
    }

    // Category validation
    if (!category.trim()) {
      setErrorMessage('Please select a category.');
      return;
    }

    // Location validation
    if (!location.trim()) {
      setErrorMessage(
        'Location cannot be empty or contain only spaces.'
      );
      return;
    }

    // Description validation
    if (!description.trim()) {
      setErrorMessage(
        'Description cannot be empty or contain only spaces.'
      );
      return;
    }

    // Image validation
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        setErrorMessage('Please upload a valid image.');
        return;
      }

      if (selectedFile.size > 2 * 1024 * 1024) {
        setErrorMessage('Image size must be 2 MB or less.');
        return;
      }

      if (!image) {
        setErrorMessage(
          'Please wait for the image preview to finish loading.'
        );
        return;
      }
    }

    // Create the issue only after validation succeeds
    const newIssue = {
      id: Date.now(),
      title: title.trim(),
      category,
      location: location.trim(),
      description: description.trim(),
      image,
      status: 'Reported',
    };

    onReportSubmit(newIssue);
  }

  return (
    <section className="container py-5">
      <div
        className="card shadow-sm mx-auto"
        style={{ maxWidth: '700px' }}
      >
        <div className="card-body p-4">
          <h2 className="text-center mb-4">
            Report a Community Issue
          </h2>

          <form onSubmit={handleSubmit} noValidate>
            {/* Error message */}
            {errorMessage && (
              <div
                className="alert alert-danger"
                role="alert"
              >
                {errorMessage}
              </div>
            )}

            {/* Issue title */}
            <div className="mb-3">
              <label
                htmlFor="issueTitle"
                className="form-label"
              >
                Issue Title
              </label>

              <input
                id="issueTitle"
                type="text"
                className="form-control"
                placeholder="Enter issue title"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                maxLength={100}
                required
              />
            </div>

            {/* Category */}
            <div className="mb-3">
              <label
                htmlFor="issueCategory"
                className="form-label"
              >
                Category
              </label>

              <select
                id="issueCategory"
                className="form-select"
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
                required
              >
                <option value="">Select a category</option>
                <option value="Road Damage">
                  Road Damage
                </option>
                <option value="Garbage">
                  Garbage Problems
                </option>
                <option value="Streetlight">
                  Broken Streetlight
                </option>
                <option value="Water">
                  Water Problem
                </option>
                <option value="Other">
                  Other
                </option>
              </select>
            </div>

            {/* Location */}
            <div className="mb-3">
              <label
                htmlFor="issueLocation"
                className="form-label"
              >
                Location
              </label>

              <input
                id="issueLocation"
                type="text"
                className="form-control"
                placeholder="Enter issue location"
                value={location}
                onChange={(event) =>
                  setLocation(event.target.value)
                }
                maxLength={200}
                required
              />
            </div>

            {/* Description */}
            <div className="mb-3">
              <label
                htmlFor="issueDescription"
                className="form-label"
              >
                Description
              </label>

              <textarea
                id="issueDescription"
                className="form-control"
                rows={4}
                placeholder="Describe the community issue"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                maxLength={1000}
                required
              />
            </div>

            {/* Image upload */}
            <div className="mb-3">
              <label
                htmlFor="issueImage"
                className="form-label"
              >
                Upload Image (Optional, maximum 2 MB)
              </label>

              <input
                id="issueImage"
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>

            {/* Image preview */}
            {image && (
              <div className="mb-3">
                <p className="fw-bold">Image Preview</p>

                <img
                  src={image}
                  alt="Selected issue preview"
                  className="img-fluid rounded"
                  style={{
                    maxHeight: '250px',
                    objectFit: 'contain',
                  }}
                />

                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm d-block mt-2"
                  onClick={() => {
                    setImage('');
                    setSelectedFile(null);
                    setErrorMessage('');

                    const input =
                      document.getElementById('issueImage');

                    if (input) {
                      input.value = '';
                    }
                  }}
                >
                  Remove Image
                </button>
              </div>
            )}

            {/* Submit and Cancel buttons */}
            <div className="d-flex flex-wrap gap-2 mt-4">
              <button
                type="submit"
                className="btn btn-primary"
              >
                Submit Report
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default ReportIssue;
