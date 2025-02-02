import { createAsyncThunk } from '@reduxjs/toolkit';
import getSupabaseClient from '../../utils/db';

export const fetchGraphPositions = createAsyncThunk(
  'graphPositions/fetchGraphPositions',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await getSupabaseClient()
        .from('graph_positions')
        .select('positions')
        .single();

      if (error) {
        return rejectWithValue(error.message);
      }

      return data.positions || ['graph-one', 'graph-two'];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveGraphPositions = createAsyncThunk(
    'graphPositions/saveGraphPositions',
    async (positions, { rejectWithValue, getState }) => {
      try {
        const { graphPositions } = getState().graphPositions;
  
        const { data, error } = await getSupabaseClient()
          .from('graph_positions')
          .select('*')
          .single();
  
        if (error && error.code !== 'PGRST116') {
          return rejectWithValue(error.message);
        }
  
        if (!data) {
          const { data: insertedData, error: insertError } = await getSupabaseClient()
            .from('graph_positions')
            .insert([{ positions }]);
  
          if (insertError) {
            return rejectWithValue(insertError.message);
          }
  
          return insertedData;
        }
  
        const { data: updatedData, error: updateError } = await getSupabaseClient()
          .from('graph_positions')
          .update({ positions })
          .eq('id', data.id);
  
        if (updateError) {
          return rejectWithValue(updateError.message);
        }
  
        return updatedData;
      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
  );
  
  
  
  
  
  
  
