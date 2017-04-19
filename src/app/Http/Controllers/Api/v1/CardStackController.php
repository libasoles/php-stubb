<?php

namespace App\Http\Controllers\Api\v1;

use App\Card;
use App\Http\Controllers\Controller;
use App\Http\Traits\LogHelper;
use App\Stack;

class CardStackController
{
    use LogHelper;
      
    /**
     * Display the card with stacks.
     *
     * @param  int $id
     * @return Response
     */
    public function showStacks(int $id)
    {        
        $data = [];
        
        try {

            $data = Card::with('stacks')->findOrFail($id);
        } catch (ModelNotFoundException $e) {
            return response()->json([ 'message' => 'Not found'], 404);
        } catch (\Exception $exc) {
            $this->logException($exc);
            return response()->json([ 'message' => 'There was an error retrieving the record' ], 500);
        }

        return $data;
    }
    
    /**
     * Display the stack's cards.
     *
     * @param  int $id
     * @return Response
     */
    public function showCards(int $id)
    {        
        $data = [];
        
        try {

            $data = Stack::with('cards')->findOrFail($id);
    
        } catch (ModelNotFoundException $e) {
            return response()->json([ 'message' => 'Not found'], 404);
        } catch (\Exception $exc) {
            $this->logException($exc);
            return response()->json([ 'message' => 'There was an error retrieving the record' ], 500);
        }

        return $data;
    }
    
    /**
     * Update the specified resource in storage.
     *
     * @param  Request  $request
     * @param  int  $id
     * @return Response
     */
    public function update(int $card_id, int $stack_id)
    {
        try {
         
            // assign card to stack               
            $stack = Stack::findOrFail($stack_id)->cards()->attach($card_id); 
  
        } catch (\Exception $exc) {
            
            $this->logException($exc);         
            return response()->json([ 'message' => 'There was an error storing the record' ], 500);
        } 
            
        return response("", 204);
    }
}
