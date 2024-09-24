/* eslint-disable react/prop-types */
import { useState } from "react";
import { useDispatch } from "react-redux";
import { updateCombination } from "../redux/reducers/productSlice";


const UpdateCombinationForm = ({ row, setExpandedRowId, fetchCombinationsFnc }) => {
  const [formData, setFormData] = useState({
    productId: row.original.productId._id,
    materialId: row.original.materialId._id,
    gradeIds: row.original.gradeIds || [],
    shape: row.original.shape || '',
    length: row.original.length || '',
    thickness: row.original.thickness || '',
    price: row.original.price || '',
    currency: row.original.currency || '',
  });

  const dispatch = useDispatch()
  
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const combinationId = row.original._id; // Get the combination ID

    try {
      const result = await dispatch(updateCombination({ combinationId, formData })).unwrap();
      alert(result.message); 
      setExpandedRowId(null);
      fetchCombinationsFnc();
    } catch (error) {
      console.error('Error updating combination:', error);
      // Optionally handle error (e.g., show an error message)
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Product Name:
        <input
          type="text"
          value={row.original.productId.name}
          readOnly // Assuming product name is not editable
        />
      </label>
      <label>
        Material:
        <input
          type="text"
          value={row.original.materialId.name}
          readOnly // Assuming material name is not editable
        />
      </label>
      <label>
        Grade IDs:
        <input
          type="text"
          name="gradeIds"
          value={formData.gradeIds.join(', ')} // Display as comma-separated values
          onChange={(e) => handleChange({
            target: {
              name: 'gradeIds',
              value: e.target.value.split(',').map(id => id.trim()), // Update gradeIds on change
            }
          })}
        />
      </label>
      <label>
        Shape:
        <input
          type="text"
          name="shape"
          value={formData.shape}
          onChange={handleChange}
        />
      </label>
      <label>
        Length:
        <input
          type="number"
          name="length"
          value={formData.length}
          onChange={handleChange}
        />
      </label>
      <label>
        Thickness:
        <input
          type="number"
          name="thickness"
          value={formData.thickness}
          onChange={handleChange}
        />
      </label>
      <label>
        Price:
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
        />
      </label>
      <label>
        Currency:
        <input
          type="text"
          name="currency"
          value={formData.currency}
          onChange={handleChange}
        />
      </label>
      <button type="submit">Save</button>
      <button type="button" onClick={() => setExpandedRowId(null)}>Cancel</button>
    </form>
  );
};

export default UpdateCombinationForm