/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addCombination } from '../redux/reducers/productSlice';

const AddProduct = ({ showAddFnc, fetchCombinationsFnc }) => {
  const products = useSelector((state) => state.product.products);
  const materials = useSelector((state) => state.product.materials);
  const grades = useSelector((state) => state.product.grades);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [selectedGrades, setSelectedGrades] = useState({});

  const dispatch = useDispatch()
  
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
    <div className='w-100 h-100 position-absolute d-flex justify-content-center align-items-center'>
      <div className='w-50 h-50 position-relative bg-white m-auto z-3 p-3'>
        <div className='d-flex justify-content-end w-100' onClick={() => showAddFnc(false)}>
          <button>Close</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {/* First Column: Product */}
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

            {/* Second Column: Material */}
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

            {/* Third Column: Grade */}
            <div>
              <h3>Grade</h3>
              {selectedProduct && selectedMaterial && grades.map((grade) => {
                const mergedName = `${materials.find(mat => mat._id === selectedMaterial)?.name} ${grade.name} ${products.find(prod => prod._id === selectedProduct)?.name}`;
                return (
                  <div key={grade._id}>
                    <input
                      type="checkbox"
                      id={grade._id}
                      onChange={handleGradeChange}
                    />
                    <label htmlFor={grade._id}>{mergedName}</label>
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
