-- Drop existing constraint
ALTER TABLE risk_assessments 
DROP CONSTRAINT IF EXISTS risk_assessments_primary_condition_check;

-- Add new constraint with all possible values
ALTER TABLE risk_assessments 
ADD CONSTRAINT risk_assessments_primary_condition_check 
CHECK (primary_condition IN (
    'NORMAL', 
    'PPH', 
    'PRE_ECLAMPSIA', 
    'OBSTRUCTED_LABOUR', 
    'SEPSIS', 
    'NONE', 
    'Suspected complication'
));
