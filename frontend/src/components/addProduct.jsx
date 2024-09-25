/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addCombination } from '../redux/reducers/productSlice';
import { SlClose } from "react-icons/sl";

const AddProduct = ({ showAddFnc, fetchCombinationsFnc }) => {
  const products = useSelector((state) => state.product.products);
  const materials = useSelector((state) => state.product.materials);
  const grades = useSelector((state) => state.product.grades);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [selectedGrades, setSelectedGrades] = useState({});

  const dispatch = useDispatch();

  const handleProductChange = (event) => {
    setSelectedProduct(event.target.value);
    setSelectedMaterial(null); // Reset material when product changes
  };

  const handleMaterialChange = (event) => {
    setSelectedMaterial(event.target.value);
  };

  const handleGradeChange = (event) => {
    const { id, checked } = event.target;
    setSelectedGrades((prev) => ({
      ...prev,
      [id]: checked,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const gradeIds = Object.keys(selectedGrades).filter((key) => selectedGrades[key]);

    const body = {
      productId: selectedProduct,
      materialId: selectedMaterial,
      gradeIds,
    };

    try {
      const result = await dispatch(addCombination(body)).unwrap();
      fetchCombinationsFnc();
      alert(result.message);
      showAddFnc(false);
    } catch (error) {
      console.error('Error adding combination:', error);
      alert('Error adding combination');
    }
  };

  return (
    <div className='w-100 h-100 position-absolute d-flex justify-content-center align-items-center fs-6'>
      <div className='w-75 h-75 position-relative bg-white m-auto z-3 p-3'>
        <div className='d-flex justify-content-between w-100' onClick={() => showAddFnc(false)}>
          <h3 className='fw-bold'>Add Products</h3>
          <span style={{ cursor: 'pointer' }}>
            <SlClose />
          </span>
        </div>
        <form onSubmit={handleSubmit} className='d-flex flex-column justify-content-between w-100'>
          <div className='row row-cols-3 d-flex justify-content-between' >
            <div>
              <h3>Product</h3>
              {products.map((product) => (
                <div key={product._id}>
                  <input
                    type="radio"
                    name="product"
                    value={product._id}
                    onChange={handleProductChange}
                  />
                  {product.name}
                </div>
              ))}
            </div>

            <div>
              <h3>Material</h3>
              {materials.map((material) => (
                <div key={material._id}>
                  <input
                    type="radio"
                    name="material"
                    value={material._id}
                    onChange={handleMaterialChange}
                    disabled={!selectedProduct} // Disable if no product selected
                  />
                  {material.name}
                </div>
              ))}
            </div>

            <div>
              <h3>Grade</h3>
              {selectedProduct && selectedMaterial && grades.map((grade) => {
                const mergedName = `${materials.find(mat => mat._id === selectedMaterial)?.name} ${grade.name} ${products.find(prod => prod._id === selectedProduct)?.name}`;
                return (
                  <div className={`form-check form-check-reverse add-check rounded-pill align-items-center`} key={grade._id}>
                    <input className="form-check-input" type="checkbox"
                      id={grade._id}
                      onChange={handleGradeChange} />
                    <label className="form-check-label text-start" htmlFor={grade._id}>{mergedName}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
          <button type="submit">Add Combination</button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
