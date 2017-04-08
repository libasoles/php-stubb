<?php
namespace App\Http\Controllers\Api\v1;

use App\Card;
use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use function abort;
use function response;


class CardController extends Controller
{
    use ValidatesRequests;

    /**
     * Display a listing of the cards.
     *
     * @return Response
     */
    public function index()
    {
        $data = [];
        
        try {

            $data = Card::all();
        } catch (\Exception $exc) {
            Log::error(get_class() . ' ' . $exc->getMessage());
            abort(500, 'There was an error retrieving the records'); 
        }

        return $data;
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return Response
     */
    public function get(int $id)
    {        
        $data = [];
        
        try {

            $data = Card::findOrFail($id);
        } catch (ModelNotFoundException $e) {
            abort(500, 'Not found'); 
        } catch (\Exception $exc) {
            Log::error(get_class() . ' ' . $exc->getMessage());
            abort(500, 'There was an error retrieving the record');
        }

        return $data;
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  Request  $request
     * @return Response
     */
    public function store(Request $request)
    {
        try {

            // validation
            $this->validate($request, [
                'name' => 'max:255',
                'content' => 'required'
            ]);

            // create record                
            $card = new Card;
            $card->name = $request->input('name');
            $card->content = $request->input('content');
            $card->enabled = true;

            $card->save();
            
        } catch (\Exception $exc) {
            abort(500, 'There was an error creating the record');
            Log::error(get_class() . ' ' . $exc->getMessage());
        }

        return response()->json([
            'created'=>true,
            'id'=>$card->id
            ], 201);
    }
    
    /**
     * Update the specified resource in storage.
     *
     * @param  Request  $request
     * @param  int  $id
     * @return Response
     */
    public function update(Request $request, int $id)
    {
        try {
            
            // validation
            $this->validate($request, [
                'name' => 'max:255',
                'content' => 'required'
            ]);

            // update existing record                
            $card = Card::find($id);
            $card->name = $request->input('name');
            $card->content = $request->input('content');
            $card->enabled = true;

            $card->save();
  
        } catch (\Exception $exc) {
            Log::error(get_class() . ' ' . $exc->getMessage());
            abort(500, 'There was an error storing the record');
        }

        return response("", 204);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return Response
     */
    public function destroy(int $id)
    {
        try {
            
            Card::destroy($id);
        } catch (\Exception $exc) {
            Log::error(get_class() . ' ' . $exc->getMessage());
            abort(500, 'There was an error deleting the record');
        }

        return response("", 204);
    }
}
