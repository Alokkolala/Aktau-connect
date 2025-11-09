
import { createClient } from '@supabase/supabase-js';

// !! ВАЖНО: ЗАМЕНИТЕ ЭТИ ПЛЕЙСХОЛДЕРЫ НА ВАШИ РЕАЛЬНЫЕ КЛЮЧИ ИЗ SUPABASE !!
const supabaseUrl: string = 'https://wrajbyqnrjjhrthhxuuu.supabase.co'; 
const supabaseAnonKey: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyYWpieXFucmpqaHJ0aGh4dXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1ODI2NjQsImV4cCI6MjA3ODE1ODY2NH0.m680N4qklyoEk-C9YjOpuyUvLkepn-giElbIHdOPOSQ'; 

// Указываем тип для экспорта
export const supabase = createClient(supabaseUrl, supabaseAnonKey);