import {
    ADD_CLASS,
    ADD_SECTION,
    DELETE_CLASS,
    DELETE_SECTION,
    FETCH_CLASSES_FAILURE,
    FETCH_CLASSES_REQUEST,
    FETCH_CLASSES_SUCCESS,
    UPDATE_CLASS
} from "./Action";

/**
 * @typedef {Object} ClassSection
 * @property {string} id - Unique identifier
 * @property {string} name - Name of the class/section
 * @property {Array<Section>} sections - Array of sections
 */

/**
 * @typedef {Object} Section
 * @property {string} id - Unique identifier
 * @property {string} name - Name of the section
 */

/**
 * @typedef {Object} ClassState
 * @property {boolean} loading - Loading state
 * @property {Array<ClassSection>} classes - Array of classes
 * @property {string|null} error - Error message if any
 */

/** @type {ClassState} */
const initialState = {
    loading: false,
    classes: [],
    error: null,
};

/**
 * Reducer for managing class and section state
 * @param {ClassState} state - Current state
 * @param {Object} action - Redux action
 * @returns {ClassState} New state
 */
export const classesReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_CLASSES_REQUEST:
            return {
                ...state,
                loading: true,
                error: null
            };

        case FETCH_CLASSES_SUCCESS:
            return {
                ...state,
                loading: false,
                classes: action.payload,
                error: null
            };

        case FETCH_CLASSES_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload
            };

        case ADD_CLASS:
            return {
                ...state,
                classes: [...state.classes, action.payload],
                error: null
            };

        case UPDATE_CLASS:
            return {
                ...state,
                classes: state.classes.map((c, index) =>
                    index === action.payload.index ? action.payload.updatedClass : c
                ),
                error: null
            };

        case DELETE_CLASS:
            return {
                ...state,
                classes: state.classes.filter((c) => c.id !== action.payload),
                error: null
            };

        case ADD_SECTION:
            return {
                ...state,
                classes: state.classes.map((c, index) =>
                    index === action.payload
                        ? {
                            ...c,
                            sections: [...c.sections, {name: '', id: `temp-${Date.now()}`}]
                        }
                        : c
                ),
                error: null
            };

        case DELETE_SECTION:
            return {
                ...state,
                classes: state.classes.map((c, index) =>
                    index === action.payload.classIndex
                        ? {
                            ...c,
                            sections: c.sections.filter(
                                (_, sIndex) => sIndex !== action.payload.sectionIndex
                            ),
                        }
                        : c
                ),
                error: null
            };

        default:
            return state;
    }
};
