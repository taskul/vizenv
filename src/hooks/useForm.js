import { useEffect, useState } from "react";
import React from "react"; 

export default function useForm( initialState = {}) {
    const [inputs, setInputs] = useState(initialState);

    // we set this up to avoid infinite loop in useEffect
    const initialValues = Object.values(initialState).join('');

    useEffect(() => {
        setInputs(initialState);
    }, [initialValues]);

    function handleChange(e) {
        let { value, name } = e.target;
        setInputs({
            // copy the existing state,
            ...inputs,
            // this way we can dynamically change name of the input field
            [name]: value,
          });
    }

    function resetForm() {
        setInputs(initialState);
    }
    return { inputs, handleChange, resetForm };

}