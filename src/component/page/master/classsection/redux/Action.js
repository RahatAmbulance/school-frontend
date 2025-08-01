import {api} from "../../../../../common";
import {toast} from 'react-toastify';

// Action Types
export const FETCH_CLASSES_REQUEST = 'FETCH_CLASSES_REQUEST';
export const FETCH_CLASSES_SUCCESS = 'FETCH_CLASSES_SUCCESS';
export const FETCH_CLASSES_FAILURE = 'FETCH_CLASSES_FAILURE';
export const ADD_CLASS = 'ADD_CLASS';
export const UPDATE_CLASS = 'UPDATE_CLASS';
export const DELETE_CLASS = 'DELETE_CLASS';
export const ADD_SECTION = 'ADD_SECTION';
export const DELETE_SECTION = 'DELETE_SECTION';

// Action Creators
export const fetchClassesRequest = () => ({type: FETCH_CLASSES_REQUEST});
export const fetchClassesSuccess = (classes) => ({type: FETCH_CLASSES_SUCCESS, payload: classes});
export const fetchClassesFailure = (error) => ({type: FETCH_CLASSES_FAILURE, payload: error});

export const addClass = (newClass) => ({type: ADD_CLASS, payload: newClass});
export const updateClass = (updatedClass) => ({type: UPDATE_CLASS, payload: updatedClass});
export const deleteClass = (classId) => ({type: DELETE_CLASS, payload: classId});
export const addSection = (classIndex) => ({type: ADD_SECTION, payload: classIndex});
export const deleteSection = (classIndex, sectionIndex) => ({
    type: DELETE_SECTION,
    payload: {classIndex, sectionIndex}
});

// Async Actions
export const fetchClasses = (schoolId, session) => async (dispatch) => {
    dispatch(fetchClassesRequest());
    try {
        const response = await api.get('/api/master/class', {
            params: {schoolId, session}
        });
        dispatch(fetchClassesSuccess(response.data));
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to fetch classes';
        dispatch(fetchClassesFailure(errorMessage));
        toast.error(errorMessage);
    }
};

export const submitClasses = (classes, schoolId, session) => async (dispatch) => {
    try {

        const processedClasses = classes.map(classItem => {
            // Process each class
            return {
                ...classItem,
                sections: classItem.sections.map(section => {
                    // For each section, either remove the id or generate a longer permanent id
                    const processedSection = {...section};

                    // Check if it's a temporary ID
                    if (!section.id || section.id.startsWith('temp-')) {
                        // Remove the id property to let backend generate it
                        delete processedSection.id;
                        // Or alternatively, generate a longer UUID-like ID:
                        // processedSection.id = generateLongerId();
                    }

                    return processedSection;
                })
            };
        });
        await api.post('/api/master/class', processedClasses);
        toast.success('Classes and sections updated successfully!');
        dispatch(fetchClasses(schoolId, session));
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to update classes and sections';
        toast.error(errorMessage);
        console.error('Error:', error);
    }
};

export const removeClass = (classId) => async (dispatch) => {
    try {
        await api.delete(`/api/master/class/${classId}`);
        dispatch(deleteClass(classId));
        toast.success('Class deleted successfully');
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to delete class';
        toast.error(errorMessage);
        console.error('Error:', error);
    }
};

export const removeSection = (classIndex, sectionIndex, sectionId) => async (dispatch) => {
    try {
        await api.delete(`/api/master/section/${sectionId}`);
        dispatch(deleteSection(classIndex, sectionIndex));
        toast.success('Section deleted successfully');
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to delete section';
        toast.error(errorMessage);
        console.error('Error:', error);
    }
};
