import React, { useState, useEffect } from "react";

import { Input, InputAdornment, IconButton } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import CloseIcon from "@material-ui/icons/Close";

const SearchBar = (props) => {
  const [query, setQuery] = useState("");

  const handleClear = () => {
    setQuery("");
    props.passChildData("");
  };
  //passing up to search on click
  const handleSearch = () => {
    props.passChildData(query);
  };

  useEffect(() => {
    if (query.length === 0) {
      props.passChildData("");
    }
  }, [query, props]);

  return (
    <Input
      type="text"
      size="small"
      color="primary"
      fullWidth={true}
      placeholder="Search... (WFID, Talent, Writer, Customer, Video Title)"
      endAdornment={
        <InputAdornment position="end">
          {query.length >= 1 && (
            <IconButton onClick={handleClear}>
              <CloseIcon />
            </IconButton>
          )}
          <IconButton onClick={handleSearch}>
            <SearchIcon />
          </IconButton>
        </InputAdornment>
      }
      onChange={(e) => {
        setQuery(e.target.value);
      }}
      onKeyPress={(e) => {
        if (e.key === "Enter") {
          handleSearch();
        }
      }}
      value={query}
    />
  );
};

export default SearchBar;
