import { Module } from "modules/types";
import { GridViewModel } from "./models";

export const getGridModule = (state: any): Module<GridViewModel> => {
    return state.staff.grid;
}