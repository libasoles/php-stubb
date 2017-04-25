<?php

namespace App\Http\Controllers\Api\v1;

use App\Card;
use App\Http\Controllers\Api\ApiBaseController;
use App\Http\Traits\LogHelper;
use App\Tag;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use function response;

class CardTagController extends ApiBaseController
{
    
    use LogHelper;
    
    /**
     * Display a listing of the cards.
     *
     * @return Response
     */
    public function index()
    {
        $data = [];
        
        try {

            $data = Card::with('tags')->orderBy('sticky', 'desc')->paginate(10);           
        } catch (Exception $exc) {
            $this->logException($exc);
            return response()->json([ 'message' => 'There was an error retrieving the records' ], 500);
        }

        return $data;
    }
    
    /**
     * Display the card with tags.
     *
     * @param  int  $id
     * @return Response
     */
    public function showTags(int $id)
    {        
        // TODO: check user auth
        
        $data = [];
        
        try {

            $data = Card::with('tags')->findOrFail($id);
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
     * @param  int $id Tag id
     * @return Response
     */
    public function showCards(int $id)
    {        
        $this->authorize('ownership', Tag::findOrFail($id));
        
        $data = [];
        
        try {

            $data = Tag::with('cards')->findOrFail($id);
    
        } catch (ModelNotFoundException $e) {
            return response()->json([ 'message' => 'Not found'], 404);
        } catch (Exception $exc) {
            $this->logException($exc);
            return response()->json([ 'message' => 'There was an error retrieving the record' ], 500);
        }

        return $data;
    }
}
