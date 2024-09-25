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
    surface: row.original.surface || '',
    diameter: row.original.diameter || '',
  });

  const dispatch = useDispatch();

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

  console.log({ formData });

  return (
    <form onSubmit={handleSubmit} className="gray_bg p-3">
      <div>
        <h3 className="fw-bold mb-3">Quick Edit</h3>
      </div>
      <div className="row row-cols-3">
        <div className="col d-flex align-items-center">
          <span className="me-4">Title</span>
          <span>{`${row.original.productId.name} ${row.original.materialId.name} ${row.original.gradeIds[0].name}`}</span>
        </div>
        <div className="col d-flex flex-row align-items-center ">
          <label htmlFor="price" className="me-2">Price</label>
          <div className="d-flex flex-row border border-1 border-black rounded-pill overflow-hidden bg-white">
            <select
              value={formData.currency}
              onChange={handleChange}
              name="currency"
              id="currency"
              className='form-select px-2 rounded-0 border-end border-black'>
              <option value='INR'>INR</option>
              <option value='USD'>USD</option>
            </select>
            <input value={formData?.price} onChange={handleChange} type="number" name="price" id="price" className="form-control rounded-0" />
            <select
              value={formData.weight}
              onChange={handleChange}
              name="weight"
              id="weight"
              className='form-select px-2 rounded-0 rounded-start-pill border-start border-black'>
              <option value='KG'>KG</option>
              <option value='TON'>TON</option>
            </select>
          </div>
        </div>
      </div>
      <hr className="text-black" />
      <div>
        <h3 className="fw-bold mb-3">Product Details <span className="text-danger ms-2" style={{ fontSize: '12px' }}>(Minimum 4 fields required)</span></h3>
      </div>
      <div className="row row-cols-3 gap-0 column-gap-4">
        <div className="row row-cols-2 d-flex flex-row">
          <label>
            Material
          </label>
          <input
            className='rounded-pill border border-black d-flex align-items-center mb-3'
            type="text"
            value={row.original.materialId.name}
            readOnly // Assuming material name is not editable
          />
        </div>
        <div className="row row-cols-2 d-flex flex-row">
          <label>
            Shape
          </label>
          <input
            className='rounded-pill border border-black d-flex align-items-center mb-3'
            type="text"
            name="shape"
            value={formData.shape}
            onChange={handleChange}
          />
        </div>
        <div className="row row-cols-2 d-flex flex-row">
          <label>
            Length
          </label>
          <input
            className='rounded-pill border border-black d-flex align-items-center mb-3'
            type="string"
            name="length"
            value={formData.length}
            onChange={handleChange}
          />
        </div>
        <div className="row row-cols-2 d-flex flex-row">
          <label>
            Thickness
          </label>
          <input
            className='rounded-pill border border-black d-flex align-items-center mb-3'
            type="string"
            name="thickness"
            value={formData.thickness}
            onChange={handleChange}
          />
        </div>
        <div className="row row-cols-2 d-flex flex-row">
          <label>
            Surface Finish
          </label>
          <input
            className='rounded-pill border border-black d-flex align-items-center mb-3'
            type="string"
            name="surface"
            value={formData.surface}
            onChange={handleChange}
          />
        </div>
        <div className="row row-cols-2 d-flex flex-row">
          <label>
            Outside Dia.
          </label>
          <input
            className='rounded-pill border border-black d-flex align-items-center mb-3'
            type="string"
            name="diameter"
            value={formData.diameter}
            onChange={handleChange}
          />
        </div>
      </div>
      <button className="btn border border-black blue_bg text-white rounded-pill px-5 fs-btn " type="submit">Update</button>
      <button className="btn border border-black bg-white rounded-pill px-5 fs-btn ms-4" type="button" onClick={() => setExpandedRowId(null)}>Cancel</button>
    </form>
  );
};

export default UpdateCombinationForm;