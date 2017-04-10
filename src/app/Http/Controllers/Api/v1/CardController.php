<?php
namespace App\Http\Controllers\Api\v1;

use App\Card;
use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use function abort;
use function response;


class CardController extends Controller
{
    use ValidatesRequests;
    
    protected $repository;

    function __construct(Model $repository)
    {
        $this->repository = $repository;
    }

    
    /**
     * Display a listing of the cards.
     *
     * @return Response
     */
    public function index()
    {
        $data = [];
        
        try {

            $data = $this->repository->all();
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

            $data = $this->repository->findOrFail($id);
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
            
        } catch (ValidationException $exc) {
            Log::error('Invalid data: ' . json_decode($request->getContent(), true));
            return response()->json([ 'message' => 'There was a validation error' ], 400);
        } catch (\Exception $exc) {
            Log::error(get_class() . ' ' . $exc->getMessage());
            return response()->json([ 'message' => 'There was an error creating the record' ], 500);
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
            $card = $this->repository->find($id);
            $card->name = $request->input('name');
            $card->content = $request->input('content');
            $card->enabled = true;

            $card->save();
  
        } catch (\Exception $exc) {
            Log::error(get_class() . ' ' . $exc->getMessage());
            return response()->json([ 'message' => 'There was an error storing the record' ], 500);
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
            
            $this->repository->destroy($id);
        } catch (\Exception $exc) {
            Log::error(get_class() . ' ' . $exc->getMessage());
            return response()->json([ 'message' => 'There was an error deleting the record' ], 500);
        }

        return response("", 204);
    }
}
