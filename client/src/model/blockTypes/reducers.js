import {
	BLOCK_TYPE, BLOCK_TYPE_GROUP,
	ADD_BLOCK_TYPE, REMOVE_BLOCK_TYPE, MOVE_BLOCK_TYPE,
	ADD_BLOCK_TYPE_GROUP, REMOVE_BLOCK_TYPE_GROUP, MOVE_BLOCK_TYPE_GROUP,
} from './constants'
import { generateNewId, resolveIndex } from '../../utils/data'

/*
 * The initial state for the reducer.
 */
const initialState = {
	collection: {},
	groups: {},
	structure: [],
}

/**
 * @param {Object} payload
 * @return {Object}
 */
function formatBlockType(payload)
{
	return {
		id: payload.id ? String(payload.id) : generateNewId(),
		name: String(payload.name || ''),
		handle: String(payload.handle || ''),
		max: Math.max(0, payload.max|0),
		topLevel: (typeof payload.topLevel === 'boolean') ? payload.topLevel : true,
		childrenIds: (payload.childrenIds instanceof Array) ? payload.childrenIds.map((id) => String(id)) : [],
		maxChildren: Math.max(0, payload.maxChildren|0),
		tabs: (payload.tabs instanceof Array) ? payload.tabs.map((tab) => ({
			name: String(tab.name),
			fieldIds: (tab.fieldIds instanceof Array) ? tab.fieldIds.map((id) => String(id)) : [],
		})) : [],
		errors: (payload.errors instanceof Array) ? payload.errors.map((e) => ({
			type: String(e.type || ''),
			message: String(e.message || ''),
		})) : [],
		template: {
			html: String((payload.template && payload.template.html) || ''),
			css: String((payload.template && payload.template.css) || ''),
			js: String((payload.template && payload.template.js) || ''),
		},
	}
}

function formatBlockTypeGroup(payload)
{
	return {
		id: payload.id ? String(payload.id) : generateNewId(),
		name: String(payload.name || ''),
	}
}

/**
 * @param {Array} structure
 * @param {String} type
 * @param {String} id
 * @param {Number} index
 * @return {Array}
 */
function addToStructure(structure, type, id, index=-1)
{
	index = resolveIndex(index, structure.length + 1)
	const addItem = { type, id }
	
	return [ ...structure.slice(0, index), addItem, ...structure.slice(index) ]
}

/**
 * @param {Array} structure
 * @param {String} type
 * @param {String} id
 * @return {Array}
 */
function removeFromStructure(structure, type, id)
{
	return structure.filter((item) => (item.type !== type || item.id !== id))
}

/**
 * @param {Array} structure
 * @param {String} type
 * @param {String} id
 * @param {Number} index
 * @return {Array}
 */
function moveInStructure(structure, type, id, index)
{
	index = resolveIndex(index, structure.length)
	const moveItem = structure.find((item) => (item.type === type && item.id === id))

	structure = removeFromStructure(structure, type, id)

	return [ ...structure.slice(0, index), moveItem, ...structure.slice(index) ]
}

/**
 * @param {Object} state
 * @param {Object} action
 * @return {Object}
 */
export default function blockTypesReducer(state=initialState, action)
{
	switch(action.type)
	{
		case ADD_BLOCK_TYPE:
		{
			const blockType = formatBlockType(action.payload.blockType)
			const { index } = action.payload

			if(!(blockType.id in state.collection))
			{
				const collection = Object.assign({ [blockType.id]: blockType }, state.collection)
				const groups = state.groups
				const structure = addToStructure(state.structure, BLOCK_TYPE, blockType.id, index)

				return { collection, groups, structure }
			}
		}
		break
		case REMOVE_BLOCK_TYPE:
		{
			const { blockTypeId } = action.payload

			if(blockTypeId in state.collection)
			{
				const collection = Object.assign({}, state.collection)
				const groups = state.groups
				const structure = removeFromStructure(state.structure, BLOCK_TYPE, blockTypeId)

				delete collection[blockTypeId]

				return { collection, groups, structure }
			}
		}
		break
		case MOVE_BLOCK_TYPE:
		{
			const { blockTypeId, index } = action.payload
			const { collection, groups } = state

			if(blockTypeId in collection)
			{
				const structure = moveInStructure(state.structure, BLOCK_TYPE, blockTypeId, index)

				return { collection, groups, structure }
			}
		}
		break
		case ADD_BLOCK_TYPE_GROUP:
		{
			const blockTypeGroup = formatBlockTypeGroup(action.payload.blockTypeGroup)
			const { index } = action.payload

			if(!(blockTypeGroup.id in state.groups))
			{
				const collection = state.collection
				const groups = Object.assign({ [blockTypeGroup.id]: blockTypeGroup }, state.groups)
				const structure = addToStructure(state.structure, BLOCK_TYPE_GROUP, blockTypeGroup.id, index)

				return { collection, groups, structure }
			}
		}
		break
		case REMOVE_BLOCK_TYPE_GROUP:
		{
			const { blockTypeGroupId } = action.payload

			if(blockTypeGroupId in state.groups)
			{
				const collection = state.collection
				const groups = Object.assign({}, state.groups)
				const structure = removeFromStructure(state.structure, BLOCK_TYPE_GROUP, blockTypeGroupId)

				delete groups[blockTypeGroupId]

				return { collection, groups, structure }
			}
		}
		break
		case MOVE_BLOCK_TYPE_GROUP:
		{
			const { blockTypeGroupId, index } = action.payload
			const { collection, groups } = state

			if(blockTypeGroupId in groups)
			{
				const structure = moveInStructure(state.structure, BLOCK_TYPE_GROUP, blockTypeGroupId, index)

				return { collection, groups, structure }
			}
		}
		break
	}

	return state
}