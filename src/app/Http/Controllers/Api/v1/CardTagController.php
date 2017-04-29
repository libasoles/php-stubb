<?php

namespace App\Http\Controllers\Api\v1;

use App\Card;
use App\Http\Controllers\Api\ApiBaseController;
use App\Http\Traits\LogHelper;
use App\Services\QueryService;
use App\Tag;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use function response;

class CardTagController extends ApiBaseController
{
    
    use LogHelper;
    
    /**
     * Display a listing of the cards.
     *
     * @return Response
     */
    public function index(Request $request, QueryService $query)
    {
        $data = [];
        
        try {

            $data = $query->search();
        } catch (Exception $exc) {
            $this->logException($exc);
            return response()->json([ 'message' => 'There was an error retrieving the records' ], 500);
        }

        return $data;
    }
    
    /**
     * Display the card with tags.
     *
     * @param  int  $card_id
     * @return Response
     */
    public function showTags(int $card_id)
    {        
        // TODO: check user auth
        
        $data = [];
        
        try {

            $data = Card::with('tags')->findOrFail($card_id);
        } catch (ModelNotFoundException $e) {
            return response()->json([ 'message' => 'Not found'], 404);
        } catch (Exception $exc) {
            $this->logException($exc);
            return response()->json([ 'message' => 'There was an error retrieving the record' ], 500);
        }

        return $data;
    }
    
    /**
     * Display the tag's cards.
     *
     * @param  int $tag_id Tag id
     * @return Response
     */
    public function showCards(int $tag_id)
    {        
        $this->authorize('ownership', Tag::findOrFail($tag_id));
        
        $data = [];
        
        try {

            $data = Tag::with('cards')->findOrFail($tag_id);
    
        } catch (ModelNotFoundException $e) {
            return response()->json([ 'message' => 'Not found'], 404);
        } catch (Exception $exc) {
            $this->logException($exc);
            return response()->json([ 'message' => 'There was an error retrieving the record' ], 500);
        }

        return $data;
    }
    
    public function store(Request $request, int $card_id) 
    {
        $card = Card::findOrFail($card_id);
        
        $this->authorize('ownership', $card);
        
        try{
            
            // validation
            $this->validate($request, [
                'name' => 'required|max:60'
            ]);
            
            $tag_name = $request->input('name');
            $tag = Tag::firstOrCreate(
                ['key' => str_slug($tag_name)],
                ['name' => $tag_name]);
                  
            if(!$card->tags->contains($tag->id)) {
                $card->tags()->attach($tag->id);
            }
            
        } catch (Exception $exc) {
            $this->logException($exc);
            return response()->json([ 'message' => 'There was an error saving the record' ], 500);
        }
        
        return response()->json([
            'created'=>true,
            'id'=>$tag->id
            ], 201);
    }
}
