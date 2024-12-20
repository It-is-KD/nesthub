import React, { useState } from 'react';
import { TextField, Autocomplete } from '@mui/material';

const SearchableDropdown = ({ options, label, value, onChange, getOptionLabel, renderOption }) => {
  const [inputValue, setInputValue] = useState('');

  const sortedOptions = [...options].sort((a, b) => {
    if (a.unreadCount && !b.unreadCount) return -1;
    if (!a.unreadCount && b.unreadCount) return 1;
    return 0;
  });

  return (
    <Autocomplete
      options={sortedOptions}
      renderInput={(params) => <TextField {...params} label={label} />}
      value={value}
      onChange={(event, newValue) => {
        onChange(newValue);
      }}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      getOptionLabel={getOptionLabel}
      renderOption={renderOption}
      freeSolo
      filterOptions={(options, { inputValue }) => {
        return options.filter(option =>
          getOptionLabel(option).toLowerCase().includes(inputValue.toLowerCase())
        );
      }}
    />
  );
};

export default SearchableDropdown;