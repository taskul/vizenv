// addon.cpp
#include <node.h>
#include <v8.h>

using namespace v8;

void DoubleNumber(const FunctionCallbackInfo<Value> &args)
{
    Isolate *isolate = args.GetIsolate();
    if (args.Length() < 1 || !args[0]->IsNumber())
    {
        isolate->ThrowException(Exception::TypeError(
            String::NewFromUtf8(isolate, "Number expected", NewStringType::kNormal).ToLocalChecked()));
        return;
    }

    double value = args[0].As<Number>()->Value();
    Local<Number> result = Number::New(isolate, value * 2);
    args.GetReturnValue().Set(result);
}

void Initialize(Local<Object> exports)
{
    NODE_SET_METHOD(exports, "doubleNumber", DoubleNumber);
}

NODE_MODULE(addon, Initialize)
