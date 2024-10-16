import React, { useState, useEffect } from "react";
import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { FormControlLabel, Checkbox, FormGroup } from "@material-ui/core";

import FilterListIcon from "@material-ui/icons/FilterList";

export default function FilterDropDown(props) {
  const filters = props.filters;

  //these are from material-ui example, sets position and open/closed of menu
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const [checkedArr, setCheckedArr] = useState(props.checked);

  const handleClose = (e) => {
    //closes menu
    setAnchorEl(null);

    //sets check
    const isChecked = e.target.checked;
    const checkVal = e.target.value;
    //doing ... to populate into new array
    const newArr = [...checkedArr];
    if (checkVal && isChecked) {
      newArr.push(checkVal);
    } else if (checkVal && !isChecked) {
      const pos = checkedArr.indexOf(checkVal);
      newArr.splice(pos, 1);
    }
    setCheckedArr(newArr);
  };

  useEffect(() => {
    props.passChildData(checkedArr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkedArr]);

  return (
    <div>
      <Button
        id="filter-button"
        aria-controls={open ? "filter-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        <FilterListIcon fontSize="small" style={{ color: "white" }} />
      </Button>
      <Menu
        id="filter-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "filter-button",
        }}
      >
        <FormGroup>
          {filters.map((filter) => {
            return (
              <MenuItem key={filter}>
                <FormControlLabel
                  control={
                    <Checkbox
                      value={filter}
                      checked={checkedArr.indexOf(filter) > -1 ? true : false}
                      onChange={(e) => {
                        handleClose(e);
                      }}
                    />
                  }
                  label={filter}
                />
              </MenuItem>
            );
          })}
        </FormGroup>
      </Menu>
    </div>
  );
}
