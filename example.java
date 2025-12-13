package frontend;

public class example {
  public static void main(String[] args) {
    int[] arr= new int[11];
    arr[0]= 0;
    arr[1]= 1;
    for(int i=2;i<11;++i){
      arr[i]= arr[i-1]+arr[i-2];
    }
    for(int i: arr)
      System.out.print(i+" ");
  }
}
