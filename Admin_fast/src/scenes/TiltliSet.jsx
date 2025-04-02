import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";

const TitliAdmin = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {

    fetchImages();
    const intervalId = setInterval(fetchImages, 10000);

   
    return () => clearInterval(intervalId);
  }, []);

  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     window.location.reload();
  //   }, 6000);

  //   return () => clearInterval(intervalId);
  // }, []);


  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/titli/get-all-random-images`);
      setImages(response.data.randomImages[0].Images);
      console.log(response.data.randomImages[0].Images);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching images:", error);
      setLoading(false);
    }
  };

  const toggleIsAllowed = async (image) => {
    try {
      const updatedStatus = !image.isAllowed;
      console.log(updatedStatus)
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/titli/update-is-allowed`, {
        image: image.image,
        isAllowed: updatedStatus,
      });
      setImages((prev) =>
        prev.map((img) =>
          img.image === image.image ? { ...img, isAllowed: updatedStatus } : img
        )
      );
    } catch (error) {
      console.error("Error updating isAllowed status:", error);
    }
  };

  return (
    <Container>
      <h1>Admin Panel - Manage Images</h1>
      {loading ? (
        <p>Loading images...</p>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Amount</th>
              <th>Allowed</th>
            </tr>
          </thead>
          <tbody>
            {images.map((image) => (
              <tr key={image.image}>
                <td>
                  {/* <img src={`/images/${image.image}`} alt={image.image} /> */}
                  {image.image}
                </td>
                <td>{image.amount}</td>
                <td>
                  <ToggleSwitch
                    isAllowed={image.isAllowed}
                    onClick={() => toggleIsAllowed(image)}
                  >
                    {image.isAllowed ? "✅" : "❌"}
                  </ToggleSwitch>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default TitliAdmin;

const Container = styled.div`
  background: #121212;
  color: white;
  padding: 20px;
  text-align: center;
  min-height: 100vh;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;

  th, td {
    border: 1px solid #444;
    padding: 10px;
    text-align: center;
  }

  th {
    background: #1e1e1e;
  }

  img {
    width: 50px;
    height: 50px;
    border-radius: 5px;
  }
`;

const ToggleSwitch = styled.button`
  background: ${(props) => (props.isAllowed ? "#4caf50" : "#d32f2f")};
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    opacity: 0.8;
  }
`;
